import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeToModel, detectDiagramNeeded } from '@/lib/model-router';
import { AGENTS } from '@/agents';

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { checkUsageLimit, incrementUsage } = await import('@/lib/usage-tracker');
    const usage = await checkUsageLimit(userId);

    if (!usage.allowed) {
        return NextResponse.json({
            error: 'limit_exceeded',
            message: `Daily limit reached. You've used all ${usage.limit} queries. Resets at midnight UTC.`,
            usage: {
                used: usage.used,
                limit: usage.limit,
                remaining: 0,
                tier: usage.tier,
                resetAt: usage.resetAt,
                percentUsed: 100,
            },
        }, { status: 429 });
    }

    const { messages, agent } = await req.json();

    if (!messages || messages.length === 0) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content ?? '';
    const needsDiagram = detectDiagramNeeded(lastUserMessage);
    const selectedAgent = AGENTS[agent as keyof typeof AGENTS];

    if (!selectedAgent) {
        return NextResponse.json({ error: 'Invalid agent' }, { status: 400 });
    }

    const agentPrompt = selectedAgent.systemPrompt;

    const decision = routeToModel({
        query: lastUserMessage,
        mode: 'learning',
        answerType: 'detailed',
        examMode: false,
    });

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Chat] Agent: ${agent} | Model: ${decision.model}`);
    }

    const systemMessage = {
        role: 'system' as const,
        content: agentPrompt
    };

    const contextMessages = messages.slice(-8).map((m: any) => ({
        role: m.role,
        content: m.content
    }));

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: decision.model,
                max_tokens: decision.maxTokens,
                messages: [systemMessage, ...contextMessages],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('[Groq Error]', err);
            return NextResponse.json({ error: 'AI service error' }, { status: 500 });
        }

        const text = await response.text();
        let reply = '';

        try {
            const data = JSON.parse(text);
            if (data.error) {
                console.error('[Groq API error]', data.error);
                return NextResponse.json({ error: data.error.message ?? 'AI error' }, { status: 500 });
            }
            reply = data.choices?.[0]?.message?.content ?? '';
        } catch {
            console.error('[Groq non-JSON response]', text);
            return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
        }

        await incrementUsage(userId);

        const newUsed = usage.used + 1;
        const newRemaining = Math.max(0, usage.limit - newUsed);
        const newPct = Math.min(100, Math.round((newUsed / usage.limit) * 100));

        return NextResponse.json({
            reply,
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
        console.error('[Chat Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
