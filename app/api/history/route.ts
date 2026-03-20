import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'


export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { client } = createSupabaseServerClient(userId)

        const { data, error } = await client
            .from('chat_history')
            .select('role, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(100)

        if (error) throw error

        // Group messages into sessions by time gap (30 min gap = new session)
        const sessions: { role: string; content: string; created_at: string }[][] = []
        let currentSession: typeof sessions[0] = []

        for (const msg of (data || [])) {
            if (currentSession.length === 0) {
                currentSession.push(msg)
            } else {
                const lastTime = new Date(currentSession[currentSession.length - 1].created_at).getTime()
                const thisTime = new Date(msg.created_at).getTime()
                const gapMinutes = (thisTime - lastTime) / 1000 / 60

                if (gapMinutes > 30) {
                    sessions.push(currentSession)
                    currentSession = [msg]
                } else {
                    currentSession.push(msg)
                }
            }
        }
        if (currentSession.length > 0) sessions.push(currentSession)

        return NextResponse.json({ sessions, messages: data })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { client } = createSupabaseServerClient(userId)
        const { userMessage, aiMessage } = await req.json()

        const { error } = await client.from('chat_history').insert([
            { user_id: userId, role: 'user', content: userMessage },
            { user_id: userId, role: 'assistant', content: aiMessage },
        ])

        if (error) throw error
        return NextResponse.json({ ok: true })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}