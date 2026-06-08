'use client'

import type { UsageStatus } from '@/lib/usage-tracker'

interface Props {
    usage: UsageStatus | null
    loading?: boolean
}

function getResetCountdown(resetAt: string): string {
    const diff = new Date(resetAt).getTime() - Date.now()
    if (diff <= 0) return 'resets soon'
    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `resets in ${hours}h ${minutes}m`
    return `resets in ${minutes}m`
}

export function UsageMeter({ usage, loading }: Props) {
    if (loading || !usage) {
        return (
            <div className="px-3.5 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                <div className="h-10 rounded-lg" style={{ background: 'var(--bg-tertiary)' }} />
            </div>
        )
    }

    const barColor = usage.percentUsed >= 80 ? '#e57373' : 'var(--accent)'
    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <div className="px-3.5 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Daily usage</span>
                <span className="text-[11px] font-medium font-mono" style={{ color: barColor }}>
                    {usage.used}/{usage.limit}
                </span>
            </div>
            <div className="h-1 rounded-full mb-1.5" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                    style={{
                        width: `${Math.min(usage.percentUsed, 100)}%`,
                        background: barColor,
                    }}
                />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {usage.tier === 'pro' ? 'Pro' : 'Free'}
                </span>
                {usage.remaining === 0 ? (
                    <span className="text-[11px] font-mono" style={{ color: 'var(--danger)' }}>{resetCountdown}</span>
                ) : (
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{usage.remaining} left</span>
                )}
            </div>
        </div>
    )
}
