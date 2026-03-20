import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('chats')
        .select('id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('[Supabase GET sessions]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sessions: data })
}

export async function POST() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('chats')
        .insert({ user_id: userId, title: 'New Chat' })
        .select()
        .single()

    if (error) {
        console.error('[Supabase POST session]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ session: data })
}