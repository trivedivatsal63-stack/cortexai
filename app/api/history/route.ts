import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
        }

        const { data, error } = await supabase
            .from('chat_history')
            .select('role, content, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(50)

        if (error) throw error

        return NextResponse.json({ messages: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        if (!supabase) {
            return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
        }

        const { userMessage, aiMessage } = await req.json()

        const { error } = await supabase.from('chat_history').insert([
            { user_id: userId, role: 'user', content: userMessage },
            { user_id: userId, role: 'assistant', content: aiMessage },
        ])

        if (error) throw error

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}