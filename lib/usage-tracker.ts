import { createClient } from '@supabase/supabase-js'

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export const LIMITS = { free: 50, pro: 500 } as const
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
    const { data, error } = await getSupabase()
        .from('usage_logs')
        .select('tier')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.log('[usage-tracker] getUserTier no row yet, defaulting to free')
        return 'free'
    }
    return (data?.tier as Tier) ?? 'free'
}

async function getTodayCount(userId: string): Promise<number> {
    const { data, error } = await getSupabase()
        .from('usage_logs')
        .select('query_count')
        .eq('user_id', userId)
        .eq('date', getTodayUTC())
        .maybeSingle()

    if (error) {
        console.log('[usage-tracker] getTodayCount no row yet:', error.code)
        return 0
    }
    return data?.query_count ?? 0
}

export async function checkUsageLimit(userId: string): Promise<UsageStatus> {
    const tier = await getUserTier(userId)
    const limit = LIMITS[tier]
    const used = await getTodayCount(userId)

    console.log(`[usage-tracker] userId=${userId} used=${used} limit=${limit} tier=${tier}`)

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

export async function incrementUsage(userId: string): Promise<void> {
    const today = getTodayUTC()
    const tier = await getUserTier(userId)

    console.log(`[usage-tracker] incrementing for user=${userId} date=${today}`)

    const { error } = await getSupabase()
        .from('usage_logs')
        .upsert(
            { 
                user_id: userId, 
                date: today, 
                query_count: 1, 
                tier: tier,
                created_at: new Date().toISOString()
            },
            { onConflict: 'user_id,date' }
        )

    if (error) {
        console.error('[usage-tracker] upsert failed, trying manual increment:', error)
        const { data: existing } = await getSupabase()
            .from('usage_logs')
            .select('query_count')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle()
        
        if (existing) {
            await getSupabase()
                .from('usage_logs')
                .update({ query_count: (existing.query_count || 0) + 1 })
                .eq('user_id', userId)
                .eq('date', today)
        } else {
            await getSupabase()
                .from('usage_logs')
                .insert({ user_id: userId, date: today, query_count: 1, tier: tier })
        }
    }
}
