import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { routeToModel, detectDiagramNeeded } from '@/lib/model-router'
import { buildSystemPrompt } from '@/lib/prompts/system-prompt'
import { checkUsageLimit, incrementUsage } from '@/lib/usage-tracker'

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── STEP 1: Check limit BEFORE calling Groq ──────────────────────────────
    // usage.used  = messages already sent today (before this request)
    // usage.limit = max allowed (e.g. 10)
    // allowed     = used < limit  ← strictly less than
    //
    // Example:
    //   used=0,  limit=10 → allowed ✅ (1st message)
    //   used=9,  limit=10 → allowed ✅ (10th message)
    //   used=10, limit=10 → blocked  ❌ (would be 11th)
    const usage = await checkUsageLimit(userId)

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
        }, { status: 429 })
    }

    // ── STEP 2: Parse request ─────────────────────────────────────────────────
    const { messages, mode, answerType, examMode } = await req.json()

    if (!messages || messages.length === 0) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content ?? ''
    const needsDiagram = detectDiagramNeeded(lastUserMessage)
    const routerMode = mode === 'kb' || mode === 'general' ? 'learning' : 'cybersecurity'

    const decision = routeToModel({
        query: lastUserMessage,
        mode: routerMode,
        answerType: answerType ?? 'detailed',
        examMode: examMode ?? false,
    })

    if (process.env.NODE_ENV === 'development') {
        console.log(`[Router] ${decision.model} — ${decision.reasoning}`)
    }

    const systemPrompt = buildSystemPrompt({
        mode: routerMode,
        answerType: answerType ?? 'detailed',
        examMode: examMode ?? false,
        needsDiagram,
    })

    const groqMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-8).map((m: any) => ({
            role: m.role,
            content: m.content
        }))
    ]

    // ── STEP 3: Call Groq ─────────────────────────────────────────────────────
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: decision.model,
            max_tokens: decision.maxTokens,
            messages: groqMessages,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        console.error('[Groq Error]', err)
        return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const text = await response.text()
    let reply = ''

    try {
        const data = JSON.parse(text)
        if (data.error) {
            console.error('[Groq API error]', data.error)
            return NextResponse.json({ error: data.error.message ?? 'AI error' }, { status: 500 })
        }
        reply = data.choices?.[0]?.message?.content ?? ''
    } catch {
        console.error('[Groq non-JSON response]', text)
        return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
    }

    // ── STEP 4: Increment AFTER success — never charge for errors ────────────
    await incrementUsage(userId)

    // ── STEP 5: Return reply + updated usage ──────────────────────────────────
    // used + 1 because we just incremented
    const newUsed = usage.used + 1
    const newRemaining = Math.max(0, usage.limit - newUsed)
    const newPct = Math.min(100, Math.round((newUsed / usage.limit) * 100))

    return NextResponse.json({
        reply,
        usage: {
            used: newUsed,
            limit: usage.limit,
            remaining: newRemaining,
            tier: usage.tier,
            resetAt: usage.resetAt,
            percentUsed: newPct,
            // allowed reflects state AFTER this message
            // used=10, limit=10 → allowed=false → next request will be blocked
            allowed: newUsed < usage.limit,
        },
    })
}