import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { routeToModel, detectDiagramNeeded } from '@/lib/model-router'
import { buildSystemPrompt } from '@/lib/prompts/system-prompt'

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, mode, answerType, examMode } = await req.json()

    if (!messages || messages.length === 0) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // Get the latest user message for routing decisions
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').at(-1)?.content ?? ''

    const needsDiagram = detectDiagramNeeded(lastUserMessage)

    // Map your existing chat modes to the router's mode format
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
        ...messages.slice(-8), // last 8 messages for context
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
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

    return NextResponse.json({ reply })
}