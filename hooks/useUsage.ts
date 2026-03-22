'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UsageStatus } from '@/lib/usage-tracker'

/**
 * useUsage hook
 *
 * Fetches usage on mount. After that, the chat route returns
 * updated usage in its response body — call `syncUsage(newUsage)`
 * to update without an extra round-trip.
 *
 * Usage:
 *   const { usage, loading, syncUsage } = useUsage()
 *
 *   // After receiving chat response:
 *   if (data.usage) syncUsage(data.usage)
 */
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

    // Fetch on mount
    useEffect(() => {
        fetchUsage()
    }, [fetchUsage])

    // Called by the chat page after each successful message —
    // avoids a second /api/usage round-trip per query.
    const syncUsage = useCallback((newUsage: UsageStatus) => {
        setUsage(newUsage)
    }, [])

    // Is the user at or above 80% of their limit?
    const isNearLimit = usage ? usage.percentUsed >= 80 : false

    // Is the user completely out of queries?
    const isAtLimit = usage ? !usage.allowed : false

    return { usage, loading, error, syncUsage, refetch: fetchUsage, isNearLimit, isAtLimit }
}