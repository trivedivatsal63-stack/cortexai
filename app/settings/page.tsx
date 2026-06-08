'use client'
import { motion } from 'framer-motion'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(() => router.push('/'))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg" style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-fg)', fontSize: '10px', fontWeight: 500 }}>A</div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AETHER</span>
          </a>
          <div className="flex items-center gap-2.5">
            <a href="/chat" className="btn-primary text-sm">Open App →</a>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-6">
        <div className="max-w-4xl mx-auto flex gap-8">
          <nav className="flex-shrink-0" style={{ width: 180 }}>
            <div className="flex flex-col gap-0.5 sticky top-28">
              <div className="px-2.5 pb-1 pt-2 text-[11px] uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
                Settings
              </div>
              <div className="flex items-center gap-2 h-[34px] px-2.5 rounded-[var(--radius-sm)] text-sm transition-colors" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }}>
                Account
              </div>
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            <motion.div {...fadeUp}>
              <div className="text-[11px] uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Profile</div>
              <h1 className="text-2xl font-medium tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Your Account</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Manage your profile and preferences</p>
            </motion.div>

            <motion.div className="mb-6" {...fadeUp} transition={{ delay: 0.05 }}>
              <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-medium" style={{ background: 'var(--accent-subtle)', border: '2px solid var(--accent)', color: 'var(--accent)' }}>
                  {user?.fullName?.charAt(0) || user?.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'User'}</div>
                  <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{user?.primaryEmailAddress?.emailAddress}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Email</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Name</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Plan</span>
                  <span className="text-[11px] uppercase" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>Free</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Member since</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </motion.div>

            <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

            <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
              <div className="text-[11px] uppercase mb-3" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>Danger Zone</div>
              <div style={{ border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: 16 }}>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Sign out of your account on this device.</p>
                <button onClick={handleSignOut} className="btn-danger text-sm">
                  Sign out of AETHER
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
