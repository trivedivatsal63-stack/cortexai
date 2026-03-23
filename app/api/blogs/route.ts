import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    try {
        const { data, error } = await client
            .from('blogs')
            .select('id, slug, title, excerpt, category, read_time, created_at, updated_at, user_id, author:profiles!user_id(name, avatar_url)')
            .eq('published', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[GET /api/blogs]', error)
            return NextResponse.json({ error: error.message, blogs: [] }, { status: 200 })
        }

        return NextResponse.json({ blogs: data || [] })
    } catch (err) {
        console.error('[GET /api/blogs] Connection error:', err)
        return NextResponse.json({ 
            error: 'Database connection failed. Please try again.',
            blogs: [],
            retry: true 
        }, { status: 503 })
    }
}

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, content, excerpt, category, tags, published = false } = await req.json()

    if (!title?.trim() || !content?.trim()) {
        return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36)

    const readTime = Math.ceil(content.split(/\s+/).length / 200) + ' min read'

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('blogs')
        .insert({
            user_id: userId,
            title: title.trim(),
            content: content.trim(),
            excerpt: excerpt?.trim() || content.slice(0, 150).trim() + '...',
            slug,
            category: category || 'general',
            tags: tags || [],
            read_time: readTime,
            published,
        })
        .select()
        .single()

    if (error) {
        console.error('[POST /api/blogs]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blog: data })
}
