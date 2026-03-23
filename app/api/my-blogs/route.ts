import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client } = createSupabaseServerClient(userId)

    const { data, error } = await client
        .from('blogs')
        .select('id, slug, title, excerpt, category, read_time, published, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('[GET /api/my-blogs]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ blogs: data })
}
