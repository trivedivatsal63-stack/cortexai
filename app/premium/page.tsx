'use client'
import { motion } from 'framer-motion'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    label: 'Free',
    features: ['10 queries per day', 'Learning agent', 'Basic research agent', 'Standard response speed'],
    cta: 'Current Plan',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '7',
    label: '/month',
    features: [
      'Unlimited daily queries',
      'All three agent modes',
      'Advanced research & reasoning',
      'Priority response speed',
      'Export conversations to PDF',
      'Early access to new features',
    ],
    cta: 'Coming Soon',
    highlight: true,
  },
]

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function PremiumPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg" style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 500 }}>A</div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
          </a>
          <div className="flex items-center gap-2.5">
            <a href="/about" className="btn-ghost text-sm">About</a>
            <a href="/chat" className="btn-primary text-sm">Open App →</a>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-6">
        <motion.div className="max-w-xl mx-auto text-center card p-12" {...fadeUp} style={{ borderRadius: '16px' }}>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--accent)' }}>Pricing</div>
          <h1 className="text-3xl md:text-4xl tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Learn without<br /><span className="font-medium">limits</span>
          </h1>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Free tier covers daily learning. Premium unlocks everything — unlimited queries, advanced agents, and priority access.
          </p>
        </motion.div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              className="card p-8 flex flex-col"
              style={plan.highlight ? { borderRadius: '16px', borderColor: 'var(--accent)' } : { borderRadius: '16px' }}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--accent)' }}>{plan.name}</div>
              <div className="mb-6">
                <span className="text-4xl tracking-tight" style={{ color: 'var(--text-primary)' }}>${plan.price}</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-tertiary)' }}>{plan.label}</span>
              </div>
              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className="w-full py-3 rounded-xl text-sm font-medium transition-all"
                style={plan.highlight
                  ? { background: 'var(--accent)', color: 'var(--accent-fg)', cursor: 'default', opacity: 0.6, border: 'none' }
                  : { border: '1px solid var(--border)', color: 'var(--text-tertiary)', background: 'var(--bg-primary)', cursor: 'default' }
                }
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
