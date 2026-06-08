import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { client } = createSupabaseServerClient(userId)

  let onboardingCompleted = false
  let primaryUse: string | null = null

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('onboarding_completed, primary_use')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.log('[GET /api/onboarding] profile query error (columns may not exist):', profileError.message)
  } else if (profile) {
    onboardingCompleted = profile.onboarding_completed === true
    primaryUse = profile.primary_use ?? null
  }

  console.log('[GET /api/onboarding] userId:', userId, 'onboarding_completed:', onboardingCompleted, 'primary_use:', primaryUse)

  const { data: chats, error: chatsError } = await client
    .from('chats')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const hasChats = !chatsError && (chats?.length ?? 0) > 0
  const needsOnboarding = !onboardingCompleted && !hasChats

  console.log('[GET /api/onboarding] hasChats:', hasChats, 'needsOnboarding:', needsOnboarding)

  return NextResponse.json({
    needsOnboarding,
    primaryUse,
  })
}

export async function PUT(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { primaryUse } = await req.json()
  if (!primaryUse || !['student', 'cybersecurity'].includes(primaryUse)) {
    return NextResponse.json({ error: 'Invalid primary_use value' }, { status: 400 })
  }

  console.log('[PUT /api/onboarding] saving for userId:', userId, 'primaryUse:', primaryUse)

  const { client } = createSupabaseServerClient(userId)

  const { error } = await client
    .from('profiles')
    .upsert({
      id: userId,
      primary_use: primaryUse,
      onboarding_completed: true,
    }, { onConflict: 'id' })

  if (error) {
    console.error('[PUT /api/onboarding] upsert error:', error.message)

    const { error: insertError } = await client
      .from('profiles')
      .insert({
        id: userId,
        primary_use: primaryUse,
        onboarding_completed: true,
      })

    if (insertError) {
      console.error('[PUT /api/onboarding] insert fallback also failed:', insertError.message)
      return NextResponse.json({ error: insertError.message, saved: false }, { status: 500 })
    }
  }

  console.log('[PUT /api/onboarding] save successful for userId:', userId)
  return NextResponse.json({ ok: true, saved: true })
}
