import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    const { userId } = await auth()
    const { client } = createSupabaseServerClient(userId || '')

    let query = client
        .from('blogs')
        .select('*, author:profiles!user_id(name, avatar_url, bio)')

    if (!userId) {
        query = query.eq('published', true)
    }

    const { data, error } = await query.eq('slug', slug).single()

    if (error || !data) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    if (!data.published && data.user_id !== userId) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json({ blog: data })
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const { title, content, excerpt, category, tags, published } = await req.json()

    const { client } = createSupabaseServerClient(userId)

    const { data: existing } = await client
        .from('blogs')
        .select('user_id')
        .eq('slug', slug)
        .single()

    if (!existing)
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    if (existing.user_id !== userId)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updates: Record<string, unknown> = {}

    if (title !== undefined) {
        updates.title = title.trim()
        if (title !== updates.title) {
            const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
            updates.slug = newSlug
        }
    }
    if (content !== undefined) {
        updates.content = content.trim()
        updates.read_time = Math.ceil(content.split(/\s+/).length / 200) + ' min read'
    }
    if (excerpt !== undefined) updates.excerpt = excerpt.trim()
    if (category !== undefined) updates.category = category
    if (tags !== undefined) updates.tags = tags
    if (published !== undefined) updates.published = published

    const { data, error } = await client
        .from('blogs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('slug', slug)
        .select()
        .single()

    if (error) {
        console.error('[PUT /api/blogs/[slug]]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const { client } = createSupabaseServerClient(userId)

    const { data: existing } = await client
        .from('blogs')
        .select('user_id')
        .eq('slug', slug)
        .single()

    if (!existing)
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 })

    if (existing.user_id !== userId)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await client
        .from('blogs')
        .delete()
        .eq('slug', slug)

    if (error) {
        console.error('[DELETE /api/blogs/[slug]]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
