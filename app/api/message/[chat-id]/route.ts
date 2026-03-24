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
        .order('id', { ascending: true })

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
    const { role, content, id, created_at } = await req.json()

    const { client } = createSupabaseServerClient(userId)

    const { data: chat } = await client
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single()

    if (!chat)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const insertData: any = {
        chat_id: chatId,
        role,
        content
    }

    if (id) insertData.id = id;
    if (created_at) insertData.created_at = created_at;

    const { data, error } = await client
        .from('messages')
        .insert(insertData)
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


export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ 'chat-id': string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { 'chat-id': chatId } = await params
    const url = new URL(req.url)
    const messageId = url.searchParams.get('messageId')

    if (!messageId)
        return NextResponse.json({ error: 'messageId is required' }, { status: 400 })

    const { client } = createSupabaseServerClient(userId)

    const { data: chat } = await client
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', userId)
        .single()

    if (!chat)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await client
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('chat_id', chatId)

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}


export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ 'chat-id': string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { 'chat-id': chatId } = await params
    const { messageId, content } = await req.json()

    if (!messageId || content === undefined)
        return NextResponse.json({ error: 'messageId and content are required' }, { status: 400 })

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
        .update({ content })
        .eq('id', messageId)
        .eq('chat_id', chatId)
        .select()
        .single()

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: data })
}