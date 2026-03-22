import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// PATCH /api/sessions/[id]
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: sessionId } = await params
    const { title } = await req.json()

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('chats')
        .update({
            title,
            updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ session: data })
}


// DELETE /api/sessions/[id]
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: sessionId } = await params
    const { client } = createSupabaseServerClient(userId)

    await client
        .from('messages')
        .delete()
        .eq('chat_id', sessionId)

    const { error } = await client
        .from('chats')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)

    if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
}