'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UsageStatus } from '@/lib/usage-tracker'

export function useUsage() {
    const [usage, setUsage] = useState<UsageStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/usage')
            if (!res.ok) throw new Error('Failed to fetch usage')
            const data: UsageStatus = await res.json()
            setUsage(data)
        } catch (err) {
            console.error('[useUsage] fetch error:', err)
            setError('Could not load usage data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchUsage() }, [fetchUsage])

    // Called after each successful message — chat route returns updated usage
    // so we don't need a second /api/usage round-trip
    const syncUsage = useCallback((newUsage: UsageStatus) => {
        setUsage(newUsage)
    }, [])

    // FIX: isAtLimit = usage exists AND allowed is false
    // This means the user has already used all their queries
    // DO NOT use percentUsed >= 100 — that was causing premature blocking
    const isAtLimit = usage !== null && usage.allowed === false

    // Near limit = 80% or more used but NOT yet at limit
    const isNearLimit = usage !== null && usage.percentUsed >= 80 && !isAtLimit

    return {
        usage,
        loading,
        error,
        syncUsage,
        refetch: fetchUsage,
        isAtLimit,
        isNearLimit,
    }
}