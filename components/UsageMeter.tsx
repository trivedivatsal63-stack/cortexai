'use client'

import type { UsageStatus } from '@/lib/usage-tracker'

interface Props {
    usage: UsageStatus | null
    loading?: boolean
}

/**
 * UsageMeter — sits at the bottom of the sidebar.
 * Shows queries used, a colour-coded progress bar, and reset time.
 */
export function UsageMeter({ usage, loading }: Props) {
    if (loading || !usage) {
        return (
            <div style= { styles.wrap } >
            <div style={ styles.skeleton } />
                </div>
    )
    }

    // Bar colour: green → amber → red as usage climbs
    const barColor =
        usage.percentUsed >= 90
            ? '#ef4444'
            : usage.percentUsed >= 75
                ? '#f59e0b'
                : '#10b981'

    // Human-readable reset countdown e.g. "resets in 3 h 22 m"
    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <div style= { styles.wrap } >
        {/* Header row */ }
        < div style = { styles.header } >
            <span style={ styles.label }> Daily queries </span>
                < span style = {{ ...styles.count, color: barColor }
}>
    { usage.used } / { usage.limit }
    </span>
    </div>

{/* Progress bar */ }
<div style={ styles.track }>
    <div
          style={
    {
            ...styles.fill,
            width: `${Math.min(usage.percentUsed, 100)}%`,
                background: barColor,
                    // Pulse animation when >= 90%
                    animation: usage.percentUsed >= 90 ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }
}
        />
    </div>

{/* Footer row */ }
<div style={ styles.footer }>
    <span style={ styles.tier }>
        { usage.tier === 'pro' ? '⚡ Pro' : '◦ Free' }
        </span>
{
    usage.remaining === 0 ? (
        <span style= {{ ...styles.reset, color: '#ef4444' }
}>
    { resetCountdown }
    </span>
        ) : (
    <span style= { styles.reset } > { usage.remaining } left </span>
        )}
</div>

    < style > {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// ─── Time helper ─────────────────────────────────────────────────────────────

function getResetCountdown(resetAt: string): string {
    const diff = new Date(resetAt).getTime() - Date.now()
    if (diff <= 0) return 'resets soon'

    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) return `resets in ${hours}h ${minutes}m`
    return `resets in ${minutes}m`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    wrap: {
        padding: '12px 14px',
        borderTop: '1px solid rgba(48,58,80,0.6)',
        marginTop: 'auto',
    },
    skeleton: {
        height: 44,
        borderRadius: 6,
        background: 'rgba(255,255,255,0.05)',
        animation: 'pulse 1.5s ease-in-out infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontSize: 11,
        color: '#6e7681',
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        fontFamily: 'var(--font-mono, monospace)',
    },
    count: {
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'var(--font-mono, monospace)',
    },
    track: {
        height: 4,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        marginBottom: 6,
    },
    fill: {
        height: '100%',
        borderRadius: 2,
        transition: 'width 0.4s ease, background 0.4s ease',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tier: {
        fontSize: 11,
        color: '#8b949e',
        fontFamily: 'var(--font-mono, monospace)',
    },
    reset: {
        fontSize: 11,
        color: '#6e7681',
        fontFamily: 'var(--font-mono, monospace)',
    },
}
