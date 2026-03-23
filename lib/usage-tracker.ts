import { createClient } from '@supabase/supabase-js'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export const LIMITS = { free: 10, pro: 500 } as const
export type Tier = keyof typeof LIMITS

export interface UsageStatus {
    allowed: boolean
    used: number
    limit: number
    remaining: number
    tier: Tier
    resetAt: string
    percentUsed: number
}

function getTodayUTC(): string {
    return new Date().toISOString().slice(0, 10)
}

function getNextMidnightUTC(): string {
    const now = new Date()
    return new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1,
        0, 0, 0, 0
    )).toISOString()
}

async function getUserTier(userId: string): Promise<Tier> {
    const { data } = await getSupabase()
        .from('usage_logs')
        .select('tier')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    return (data?.tier as Tier) ?? 'free'
}

// Returns how many queries the user has used TODAY
async function getTodayCount(userId: string): Promise<number> {
    const { data, error } = await getSupabase()
        .from('usage_logs')
        .select('query_count')
        .eq('user_id', userId)
        .eq('date', getTodayUTC())
        .single()

    // PGRST116 = no row yet — user hasn't sent any message today
    if (error && error.code === 'PGRST116') return 0
    if (error) {
        console.error('[usage-tracker] getTodayCount error:', error)
        return 0 // fail open — never block on DB errors
    }
    return data?.query_count ?? 0
}

/**
 * checkUsageLimit
 *
 * FIX: allowed = used < limit   (strictly less than)
 *      NOT  used <= limit
 *      NOT  used >= limit
 *
 * A user with used=10 and limit=10 is NOT allowed.
 * A user with used=9  and limit=10 IS  allowed (their 10th message).
 */
export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
    const tier = await getUserTier(userId)
    const limit = LIMITS[tier]
    const used = await getTodayCount(userId)

    // ✅ CORRECT: block only when used >= limit (they've already used all 10)
    const allowed = used < limit
    const remaining = Math.max(0, limit - used)
    const percentUsed = Math.min(100, Math.round((used / limit) * 100))

    return {
        allowed,
        used,
        limit,
        remaining,
        tier,
        resetAt: getNextMidnightUTC(),
        percentUsed,
    }
}

/**
 * incrementUsage
 *
 * FIX: call this AFTER a successful Groq response only.
 * Uses an atomic upsert so concurrent requests can't double-count.
 */
export async function incrementUsage(userId: string): Promise<void> {
    const today = getTodayUTC()
    const tier = await getUserTier(userId)

    const { error } = await getSupabase().rpc('increment_query_count', {
        p_user_id: userId,
        p_date: today,
        p_tier: tier,
    })

    if (error) {
        console.error('[usage-tracker] incrementUsage error:', error)
    }
}