'use client'

import { motion } from 'framer-motion'
import { ArrowUp, Plus, CornerDownLeft, Command, X } from 'lucide-react'

interface Props {
  onClose: () => void
}

const SHORTCUTS = [
  { keys: ['⌘K', 'Ctrl+K'], desc: 'Open command palette', icon: Command },
  { keys: ['⌘N', 'Ctrl+N'], desc: 'New chat', icon: Plus },
  { keys: ['⌘Enter', 'Ctrl+Enter'], desc: 'Send message', icon: ArrowUp },
  { keys: ['1', '2', '3'], desc: 'Switch domain (input unfocused)', icon: null },
  { keys: ['Esc'], desc: 'Close modal', icon: X },
]

export function CommandPalette({ onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <motion.div
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/4 z-51 w-full max-w-[420px] rounded-2xl border p-6"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Keyboard Shortcuts</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md btn-ghost">
            <X size={14} />
          </button>
        </div>
        <div className="space-y-1">
          {SHORTCUTS.map(s => {
            const Icon = s.icon
            return (
              <div key={s.desc} className="flex items-center justify-between h-9 px-3 rounded-lg"
                style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2.5">
                  {Icon && <Icon size={13} style={{ color: 'var(--text-tertiary)' }} />}
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.desc}</span>
                </div>
                <div className="flex items-center gap-1">
                  {s.keys.map((k, i) => (
                    <span key={k}>
                      <kbd className="inline-flex items-center h-5 px-1.5 rounded text-[11px] font-mono"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {k}
                      </kbd>
                      {i < s.keys.length - 1 && <span className="mx-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>or</span>}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
