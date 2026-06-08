'use client'

import type { UsageStatus } from '@/lib/usage-tracker'
import { X, Ban } from 'lucide-react'

interface Props {
    usage: UsageStatus
    onDismiss: () => void
}

function getResetCountdown(resetAt: string): string {
    const diff = new Date(resetAt).getTime() - Date.now()
    if (diff <= 0) return 'Resets very soon'
    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `Resets in ${hours} hr ${minutes} min`
    return `Resets in ${minutes} min`
}

export function LimitReachedModal({ usage, onDismiss }: Props) {
    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <>
            <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onDismiss} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-51 w-full max-w-[420px] rounded-2xl p-7 border"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                <button onClick={onDismiss} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md btn-ghost">
                    <X size={14} />
                </button>

                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(197,52,52,0.1)' }}>
                        <Ban size={22} style={{ color: 'var(--danger)' }} />
                    </div>

                    <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Daily limit reached</h2>

                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        You&apos;ve used all <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{usage.limit} queries</strong> for
                        today on the <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Free</strong> plan.
                    </p>

                    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono border"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}>
                        <span>🕐</span>
                        <span>{resetCountdown}</span>
                    </div>

                    <div className="w-full h-px" style={{ background: 'var(--border)' }} />

                    {usage.tier === 'free' && (
                        <a href="/pricing" className="w-full text-center rounded-xl py-2.5 text-sm font-medium transition-colors"
                            style={{ background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }}>
                            ⚡ Upgrade to Pro — 500 queries/day
                        </a>
                    )}

                    <button onClick={onDismiss} className="text-xs underline btn-ghost"
                        style={{ color: 'var(--text-tertiary)' }}>
                        I&apos;ll wait — view my history
                    </button>
                </div>
            </div>
        </>
    )
}
