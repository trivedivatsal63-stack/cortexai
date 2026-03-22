import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { client } = createSupabaseServerClient(userId)

        // ── Fetch last 500 messages (enough for ~50 sessions of 10 msgs each) ──────
        const { data, error } = await client
            .from('chat_history')
            .select('role, content, created_at, mode')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(500)

        if (error) throw error

        const messages = data || []

        if (messages.length === 0) {
            return NextResponse.json({ sessions: [], messages: [] })
        }

        // ── Group into sessions by 30-min gap ────────────────────────────────────
        const sessions: typeof messages[] = []
        let current: typeof messages = []

        for (const msg of messages) {
            if (current.length === 0) {
                current.push(msg)
            } else {
                const lastTime = new Date(current[current.length - 1].created_at).getTime()
                const thisTime = new Date(msg.created_at).getTime()
                const gapMinutes = (thisTime - lastTime) / 60_000

                if (gapMinutes > 30) {
                    sessions.push(current)
                    current = [msg]
                } else {
                    current.push(msg)
                }
            }
        }
        if (current.length > 0) sessions.push(current)

        // ── Sort sessions: most recent first ─────────────────────────────────────
        sessions.sort((a, b) => {
            const aTime = new Date(a[0].created_at).getTime()
            const bTime = new Date(b[0].created_at).getTime()
            return bTime - aTime
        })

        // ── Only return last 30 sessions to keep sidebar snappy ──────────────────
        const trimmed = sessions.slice(0, 30)

        return NextResponse.json({ sessions: trimmed, messages: data })

    } catch (err: any) {
        console.error('[/api/history GET]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { client } = createSupabaseServerClient(userId)
        const { userMessage, aiMessage, mode } = await req.json()

        if (!userMessage || !aiMessage) {
            return NextResponse.json({ error: 'Missing messages' }, { status: 400 })
        }

        const { error } = await client.from('chat_history').insert([
            { user_id: userId, role: 'user', content: userMessage, mode: mode ?? 'general' },
            { user_id: userId, role: 'assistant', content: aiMessage, mode: mode ?? 'general' },
        ])

        if (error) throw error
        return NextResponse.json({ ok: true })

    } catch (err: any) {
        console.error('[/api/history POST]', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}