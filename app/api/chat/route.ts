import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { routeToModel, detectDiagramNeeded } from '@/lib/model-router'
import { buildSystemPrompt } from '@/lib/prompts/system-prompt'
import { checkUsageLimit, incrementUsage } from '@/lib/usage-tracker'

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── 1. Check limit BEFORE calling Groq ──────────────────────────────────────
    const usage = await checkUsageLimit(userId)
    if (!usage.allowed) {
        return NextResponse.json({
            error: 'limit_exceeded',
            message: `You've used all ${usage.limit} queries for today. Resets at midnight UTC.`,
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

    // ── 2. Parse request ─────────────────────────────────────────────────────────
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

    // ── 3. Call Groq ─────────────────────────────────────────────────────────────
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

    // ── 4. Increment AFTER successful response ───────────────────────────────────
    await incrementUsage(userId)

    // ── 5. Return reply + updated usage (frontend meter updates instantly) ───────
    return NextResponse.json({
        reply,
        usage: {
            used: usage.used + 1,
            limit: usage.limit,
            remaining: usage.remaining - 1,
            tier: usage.tier,
            resetAt: usage.resetAt,
            percentUsed: Math.round(((usage.used + 1) / usage.limit) * 100),
        },
    })
}
