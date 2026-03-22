import { createClient } from '@supabase/supabase-js'

// ── Create client inside a function so env vars are always available ──────────
// DO NOT create at module level — Next.js serverless won't have env vars yet.
function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LIMITS = {
    free: 10,
    pro: 500,
} as const

export type Tier = keyof typeof LIMITS

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsageStatus {
    allowed: boolean
    used: number
    limit: number
    remaining: number
    tier: Tier
    resetAt: string   // ISO string — next midnight UTC
    percentUsed: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayUTC(): string {
    return new Date().toISOString().slice(0, 10) // "2026-03-22"
}

function getNextMidnightUTC(): string {
    const now = new Date()
    const midnight = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0, 0
    ))
    return midnight.toISOString()
}

// ─── Core Functions ───────────────────────────────────────────────────────────

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

/**
 * Checks if a user is allowed to make a query.
 * Call BEFORE Groq — blocked users never spend tokens.
 */
export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
    const today = getTodayUTC()
    const tier = await getUserTier(userId)
    const limit = LIMITS[tier]

    const { data, error } = await getSupabase()
        .from('usage_logs')
        .select('query_count')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

    // PGRST116 = no rows yet — user hasn't queried today, that's fine
    if (error && error.code !== 'PGRST116') {
        console.error('[usage-tracker] checkUsageLimit error:', error)
        // Fail open — never block user on DB errors
        return {
            allowed: true,
            used: 0,
            limit,
            remaining: limit,
            tier,
            resetAt: getNextMidnightUTC(),
            percentUsed: 0,
        }
    }

    const used = data?.query_count ?? 0
    const remaining = Math.max(0, limit - used)
    const percentUsed = Math.round((used / limit) * 100)

    return {
        allowed: used < limit,
        used,
        limit,
        remaining,
        tier,
        resetAt: getNextMidnightUTC(),
        percentUsed,
    }
}

/**
 * Atomically increments today's query count.
 * Call AFTER a successful Groq response — don't charge for errors.
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