'use client'

import type { UsageStatus } from '@/lib/usage-tracker'
import { AlertTriangle, Ban } from 'lucide-react'

interface Props {
    usage: UsageStatus | null
}

function getResetCountdown(resetAt: string): string {
    const diff = new Date(resetAt).getTime() - Date.now()
    if (diff <= 0) return 'Resets soon'
    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `Resets in ${hours}h ${minutes}m`
    return `Resets in ${minutes}m`
}

export function LimitBanner({ usage }: Props) {
    if (!usage || usage.percentUsed < 80) return null

    const isExhausted = !usage.allowed
    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <div className="flex items-center gap-2.5 px-4 py-2.5 text-xs border-t border-b flex-shrink-0"
            style={{
                background: isExhausted ? 'rgba(197,52,52,0.06)' : 'rgba(197,52,52,0.03)',
                borderColor: isExhausted ? 'var(--danger)' : 'var(--border)',
                color: isExhausted ? 'var(--danger)' : 'var(--text-secondary)',
            }}
        >
            {isExhausted ? <Ban size={14} /> : <AlertTriangle size={14} />}
            <span className="flex-1 font-mono text-xs">
                {isExhausted
                    ? `Query limit reached. ${resetCountdown}.`
                    : `${usage.remaining} ${usage.remaining === 1 ? 'query' : 'queries'} remaining today. ${resetCountdown}.`
                }
            </span>
            {usage.tier === 'free' && (
                <a href="/pricing" className="text-xs font-medium whitespace-nowrap rounded-lg px-3 py-1 transition-colors"
                    style={{ color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                    Upgrade to Pro →
                </a>
            )}
        </div>
    )
}
