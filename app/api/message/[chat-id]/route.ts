import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ 'chat-id': string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { 'chat-id': chatId } = await params
    const { client } = createSupabaseServerClient(userId)

    const { data: chat } = await client
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single()

    if (!chat)
        return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await client
        .from('messages')
        .select('id, role, content, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ messages: data })
}


export async function POST(
    req: Request,
    { params }: { params: Promise<{ 'chat-id': string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { 'chat-id': chatId } = await params
    const { role, content } = await req.json()

    const { client } = createSupabaseServerClient(userId)

    const { data: chat } = await client
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single()

    if (!chat)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await client
        .from('messages')
        .insert({
            chat_id: chatId,
            role,
            content
        })
        .select()
        .single()

    await client
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: data })
}