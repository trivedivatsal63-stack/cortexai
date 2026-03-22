import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// GET — list user sessions
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('[GET /api/sessions]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}


// POST — create new session
export async function POST() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('chats')
        .insert({
            user_id: userId,
            title: 'New Chat'
        })
        .select()
        .single()

    if (error) {
        console.error('[POST /api/sessions]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}