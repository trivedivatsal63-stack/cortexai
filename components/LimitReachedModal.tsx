'use client'

import type { UsageStatus } from '@/lib/usage-tracker'

interface Props {
    usage: UsageStatus
    onDismiss: () => void
}

/**
 * LimitReachedModal — full overlay shown when the user hits 0 queries.
 * Input bar should be disabled when this is visible.
 * Dismissable — the user can still read past messages.
 */
export function LimitReachedModal({ usage, onDismiss }: Props) {
    const resetCountdown = getResetCountdown(usage.resetAt)

    return (
        <>
            {/* Backdrop */}
            <div style={styles.backdrop} onClick={onDismiss} />

            {/* Modal */}
            <div style={styles.modal} role="dialog" aria-modal="true">
                {/* Close button */}
                <button
                    onClick={onDismiss}
                    style={styles.closeBtn}
                    aria-label="Dismiss"
                >
                    ✕
                </button>

                {/* Icon */}
                <div style={styles.iconWrap}>
                    <span style={styles.icon}>🚫</span>
                </div>

                {/* Heading */}
                <h2 style={styles.heading}>Daily limit reached</h2>

                {/* Body */}
                <p style={styles.body}>
                    You've used all <strong style={{ color: '#e6edf3' }}>{usage.limit} queries</strong> for
                    today on the <strong style={{ color: '#e6edf3' }}>Free</strong> plan.
                </p>

                {/* Reset time pill */}
                <div style={styles.resetPill}>
                    <span style={{ opacity: 0.6 }}>🕐</span>
                    <span>{resetCountdown}</span>
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* CTA */}
                {usage.tier === 'free' && (
                    <a href="/pricing" style={styles.upgradeBtn}>
                        ⚡ Upgrade to Pro — 500 queries/day
                    </a>
                )}

                {/* Dismiss */}
                <button onClick={onDismiss} style={styles.dismissBtn}>
                    I'll wait — view my history
                </button>
            </div>
        </>
    )
}

// ─── Time helper ─────────────────────────────────────────────────────────────

function getResetCountdown(resetAt: string): string {
    const diff = new Date(resetAt).getTime() - Date.now()
    if (diff <= 0) return 'Resets very soon'
    const totalMinutes = Math.floor(diff / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0) return `Resets in ${hours} hr ${minutes} min`
    return `Resets in ${minutes} min`
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 10, 15, 0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
    },
    modal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 51,
        background: '#0d1117',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 16,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 0 60px rgba(239, 68, 68, 0.08), 0 24px 48px rgba(0,0,0,0.5)',
    },
    closeBtn: {
        position: 'absolute' as const,
        top: 14,
        right: 14,
        background: 'none',
        border: 'none',
        color: '#6e7681',
        cursor: 'pointer',
        fontSize: 16,
        padding: 6,
        lineHeight: 1,
        borderRadius: 4,
    },
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(239, 68, 68, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    icon: { fontSize: 26 },
    heading: {
        fontFamily: "'Syne', var(--font-display, sans-serif)",
        fontSize: 20,
        fontWeight: 700,
        color: '#e6edf3',
        textAlign: 'center',
    },
    body: {
        fontSize: 14,
        color: '#8b949e',
        textAlign: 'center',
        lineHeight: 1.6,
    },
    resetPill: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '6px 14px',
        fontSize: 12,
        fontFamily: 'var(--font-mono, monospace)',
        color: '#8b949e',
    },
    divider: {
        width: '100%',
        height: 1,
        background: 'rgba(48,58,80,0.6)',
        margin: '4px 0',
    },
    upgradeBtn: {
        display: 'block',
        width: '100%',
        textAlign: 'center',
        textDecoration: 'none',
        background: 'rgba(124, 58, 237, 0.15)',
        border: '1px solid rgba(124, 58, 237, 0.5)',
        borderRadius: 10,
        padding: '12px 20px',
        fontSize: 14,
        fontWeight: 600,
        color: '#c4b5fd',
        transition: 'all 0.15s',
        fontFamily: "'DM Sans', sans-serif",
    },
    dismissBtn: {
        background: 'none',
        border: 'none',
        fontSize: 13,
        color: '#6e7681',
        cursor: 'pointer',
        textDecoration: 'underline',
        padding: 0,
        fontFamily: "'DM Sans', sans-serif",
    },
}
