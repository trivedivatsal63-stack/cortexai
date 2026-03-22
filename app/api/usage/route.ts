import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { checkUsageLimit } from '@/lib/usage-tracker'

export async function GET() {
  try {
    const { userId } = await auth()
    console.log('[/api/usage] userId:', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usage = await checkUsageLimit(userId)
    console.log('[/api/usage] usage:', usage)

    return NextResponse.json(usage)

  } catch (err: any) {
    console.error('[/api/usage] CRASH:', err?.message ?? err)
    return NextResponse.json(
      { error: 'internal', detail: err?.message ?? String(err) },
      { status: 500 }
    )
  }
}