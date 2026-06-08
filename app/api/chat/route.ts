import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeToModel } from '@/lib/model-router';
import { AGENTS } from '@/agents';
import {
  requiresLiveData,
  fetchSearchResults,
  buildGroundingContext,
  getSafeFavicon,
} from '@/lib/search-grounding';
import {
  fetchThreatIntelResults,
  buildThreatIntelContext,
  getThreatIntelFavicon,
} from '@/lib/threat-intel-grounding';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        console.log('[Chat API] Unauthorized - no userId');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Chat API] Request from userId:', userId);

    const { checkUsageLimit, incrementUsage } = await import('@/lib/usage-tracker');
    
    let usage;
    try {
        usage = await checkUsageLimit(userId);
        console.log('[Chat API] Usage check:', usage);
    } catch (e) {
        console.error('[Chat API] Usage check error:', e);
        usage = { allowed: true, used: 0, limit: 50, remaining: 50, tier: 'free' as const, resetAt: '', percentUsed: 0 };
    }

    if (!usage.allowed) {
        console.log('[Chat API] Limit exceeded for user:', userId);
        return NextResponse.json({
            error: 'limit_exceeded',
            message: `Daily limit reached. You've used all ${usage.limit} queries.`,
            usage,
        }, { status: 429 });
    }

    const body = await req.json();
    const messages = body.messages;
    const agent = body.agent;
    const forceSearch = body.forceSearch === true;

    console.log('[Chat API] Agent:', agent, 'Messages count:', messages?.length);

    if (!messages || messages.length === 0) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content ?? '';
    console.log('[Chat API] Last user message:', lastUserMessage.substring(0, 60) + (lastUserMessage.length > 60 ? '...' : ''));

    const selectedAgent = AGENTS[agent as keyof typeof AGENTS];
    if (!selectedAgent) {
        console.log('[Chat API] Invalid agent:', agent);
        return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }

    const decision = routeToModel({
        query: lastUserMessage,
        mode: agent === 'security' ? 'cybersecurity' : agent === 'research' ? 'research' : 'learning',
        answerType: 'detailed',
        examMode: false,
    });

    console.log('[Chat API] Model:', decision.model, 'Reason:', decision.reasoning);

    let systemPromptContent = selectedAgent.systemPrompt
    let searchSources: Array<{ title: string; url: string; favicon: string }> = []

    const agentType = agent as 'learning' | 'research' | 'security'
    try {
      if (requiresLiveData(lastUserMessage, agentType, forceSearch)) {
        const [tavilyResults, threatIntelResults] = await Promise.all([
          fetchSearchResults(lastUserMessage),
          fetchThreatIntelResults(lastUserMessage, agentType),
        ])

        const allResults = [...tavilyResults, ...threatIntelResults]

        const seenUrls = new Set<string>()
        const deduped = allResults.filter(r => {
          const key = r.url || r.title
          if (seenUrls.has(key)) return false
          seenUrls.add(key)
          return true
        })

        const groundingPieces: string[] = []
        if (tavilyResults.length > 0) {
          groundingPieces.push(buildGroundingContext(tavilyResults, lastUserMessage))
        }
        if (threatIntelResults.length > 0) {
          groundingPieces.push(buildThreatIntelContext(threatIntelResults, 'threat-intel'))
        }
        const combinedContext = groundingPieces.join('\n\n')

        searchSources = [
          ...tavilyResults.map(r => ({ title: r.title, url: r.url, favicon: getSafeFavicon(r.url) })),
          ...threatIntelResults.map(r => ({ title: r.title, url: r.url, favicon: r.url ? getThreatIntelFavicon(r.url) : '' })),
        ]

        if (combinedContext) {
          systemPromptContent = combinedContext + '\n\n' + systemPromptContent
        }
      }
    } catch (err) {
      console.error('[chat/route] Search grounding failed, continuing without:', err)
    }

    systemPromptContent = `Today's date is ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.\n\n` + systemPromptContent

    const systemMessage = {
        role: 'system' as const,
        content: systemPromptContent,
    };

    const contextMessages = messages.slice(-8).map((m: any) => ({
        role: m.role,
        content: m.content
    }));

    const groqKey = process.env.GROQ_API_KEY;
    console.log('[Chat API] GROQ_KEY exists:', !!groqKey, 'First chars:', groqKey?.substring(0, 6));

    try {
        console.log('[Chat API] Calling Groq API...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: decision.model,
                max_tokens: decision.maxTokens,
                messages: [systemMessage, ...contextMessages],
            }),
        });

        console.log('[Chat API] Groq response status:', response.status);

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Chat API] Groq error:', response.status, errText);
            return NextResponse.json({ error: `AI service error (${response.status})` }, { status: 500 });
        }

        const text = await response.text();
        console.log('[Chat API] Groq response received, length:', text.length);

        let reply = '';
        try {
            const data = JSON.parse(text);
            if (data.error) {
                console.error('[Chat API] Groq API error in JSON:', data.error);
                return NextResponse.json({ error: data.error.message ?? 'AI error' }, { status: 500 });
            }
            reply = data.choices?.[0]?.message?.content ?? '';
            console.log('[Chat API] Reply extracted, length:', reply.length);
        } catch (e) {
            console.error('[Chat API] Parse error:', e, 'Text:', text.substring(0, 200));
            return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        }

        if (!reply) {
            console.error('[Chat API] Empty reply from Groq');
            return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
        }

        console.log('[Chat API] Incrementing usage...');
        try {
            await incrementUsage(userId);
        } catch (e) {
            console.error('[Chat API] Increment usage failed (non-critical):', e);
        }

        const newUsed = usage.used + 1;
        const newRemaining = Math.max(0, usage.limit - newUsed);
        const newPct = Math.min(100, Math.round((newUsed / usage.limit) * 100));

        let cutOff = false
        const trimmed = reply.trim()
        const endsWithPunct = /[.!?]\s*$/.test(trimmed)
        const openFences = (trimmed.match(/```/g) || []).length
        if (!endsWithPunct || openFences % 2 !== 0) {
          cutOff = true
          reply += '\n\n*... Response was cut off — try asking for a specific section *'
        }

        console.log('[Chat API] Success! Returning reply...');
        return NextResponse.json({
            reply,
            sources: searchSources,
            usage: {
                used: newUsed,
                limit: usage.limit,
                remaining: newRemaining,
                tier: usage.tier,
                resetAt: usage.resetAt,
                percentUsed: newPct,
                allowed: newUsed < usage.limit,
            },
        });
    } catch (error) {
        console.error('[Chat API] Catch-all error:', error);
        return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
    }
}
