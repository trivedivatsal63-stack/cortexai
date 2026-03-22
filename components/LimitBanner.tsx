'use client'

import type { UsageStatus } from '@/lib/usage-tracker'

interface Props {
    usage: UsageStatus | null
}

/**
 * LimitBanner — renders above the chat input bar.
 * Invisible below 80%. Amber warning at 80–99%. Red at 100%.
 */
export function LimitBanner({ usage }: Props) {
    if (!usage || usage.percentUsed < 80) return null

    const isExhausted = !usage.allowed

    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <div style={{
            ...styles.banner,
            background: isExhausted
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(245, 158, 11, 0.08)',
            borderColor: isExhausted
                ? 'rgba(239, 68, 68, 0.35)'
                : 'rgba(245, 158, 11, 0.35)',
        }}>
            <span style={{ fontSize: 14 }}>
                {isExhausted ? '🚫' : '⚠️'}
            </span>

            <span style={{
                ...styles.text,
                color: isExhausted ? '#fca5a5' : '#fcd34d',
            }}>
                {isExhausted
                    ? `Query limit reached. ${resetCountdown}.`
                    : `${usage.remaining} ${usage.remaining === 1 ? 'query' : 'queries'} remaining today. ${resetCountdown}.`
                }
            </span>

            {usage.tier === 'free' && (
                <a href="/pricing" style={styles.upgradeLink}>
                    Upgrade to Pro →
                </a>
            )}
        </div>
    )
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

const styles: Record<string, React.CSSProperties> = {
    banner: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 16px',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        fontSize: 13,
        flexShrink: 0,
    },
    text: {
        flex: 1,
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 12,
    },
    upgradeLink: {
        fontSize: 12,
        fontWeight: 600,
        color: '#a78bfa',
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
        fontFamily: 'var(--font-mono, monospace)',
        padding: '3px 10px',
        border: '1px solid rgba(167, 139, 250, 0.4)',
        borderRadius: 5,
        transition: 'all 0.15s',
    },
}
