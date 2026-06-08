'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, GraduationCap, BookOpen, Search, Sparkles } from 'lucide-react'

interface Props {
  onComplete: () => void
}

export function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [primaryUse, setPrimaryUse] = useState<'student' | 'cybersecurity' | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleFinish() {
    if (!primaryUse) return
    setSaving(true)
    try {
      console.log('[OnboardingModal] saving primaryUse:', primaryUse)
      const res = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryUse }),
      })
      const data = await res.json()
      console.log('[OnboardingModal] save response:', data)
      if (data.saved) {
        localStorage.setItem('sentinel_onboarding_done', 'true')
      }
    } catch (err) {
      console.error('[OnboardingModal] save failed:', err)
    }
    onComplete()
  }

  function handleNext() {
    if (step < 2) setStep(s => s + 1)
    else handleFinish()
  }

  const canProceed = step === 0 || step === 2 || (step === 1 && primaryUse !== null)

  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)' }} />
      <div className="fixed inset-0 z-51 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-[480px] rounded-2xl border p-8"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {[0, 1, 2].map(i => (
              <span key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: step === i ? 24 : 6,
                  background: step === i ? 'var(--accent)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'var(--accent-subtle)' }}>
                  <Shield size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Welcome to SENTINEL
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                  The only platform that combines AI-powered learning with a complete SOC toolkit — built for students and security professionals alike.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border text-center"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <GraduationCap size={20} style={{ color: 'var(--accent)' }} className="mx-auto mb-2" />
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Learning Platform</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>AI tutoring & research</p>
                  </div>
                  <div className="p-4 rounded-xl border text-center"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                    <Shield size={20} style={{ color: 'var(--accent)' }} className="mx-auto mb-2" />
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>SOC Suite</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Alert triage & forensics</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <h2 className="text-xl font-medium mb-1 text-center" style={{ color: 'var(--text-primary)' }}>
                  Choose your primary use
                </h2>
                <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
                  We&apos;ll tailor the experience for you.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'student' as const, icon: GraduationCap, title: "I'm a student", desc: 'Tutoring, exam prep, research, study tools' },
                    { id: 'cybersecurity' as const, icon: Shield, title: "I'm in cybersecurity", desc: 'Threat intel, IR, forensics, SIEM queries' },
                  ]).map(opt => {
                    const Icon = opt.icon
                    const selected = primaryUse === opt.id
                    return (
                      <button key={opt.id} onClick={() => setPrimaryUse(opt.id)}
                        className="p-5 rounded-xl border text-left transition-all duration-150 cursor-pointer"
                        style={{
                          background: selected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                          borderColor: selected ? 'var(--accent)' : 'var(--border)',
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: selected ? 'var(--accent)' : 'var(--bg-tertiary)' }}>
                          <Icon size={18} style={{ color: selected ? 'var(--accent-fg)' : 'var(--text-secondary)' }} />
                        </div>
                        <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{opt.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(29,158,117,0.1)' }}>
                  <Sparkles size={28} style={{ color: 'var(--success)' }} />
                </div>
                <h2 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  You&apos;re ready
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Switch between three domains in the sidebar to get the right AI for the job.
                </p>
                <div className="space-y-2.5 text-left mb-8">
                  {[
                    { icon: BookOpen, label: 'Learning', desc: 'Step-by-step tutoring, exam prep, and personalized study help' },
                    { icon: Search, label: 'Research', desc: 'Deep research with live web search and academic citations' },
                    { icon: Shield, label: 'Security', desc: 'Threat intel, alert triage, Splunk queries, and IR playbooks' },
                  ].map(d => {
                    const Icon = d.icon
                    return (
                      <div key={d.label} className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: 'var(--bg-secondary)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'var(--accent-subtle)' }}>
                          <Icon size={14} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{d.label}</p>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{d.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : null}
              className="btn-ghost h-9 px-4 text-sm"
              style={{ visibility: step === 0 ? 'hidden' : 'visible' }}>
              Back
            </button>
            <button onClick={handleNext} disabled={!canProceed || saving}
              className="btn-primary h-9 px-6 text-sm"
              style={!canProceed || saving ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
              {saving ? 'Saving...' : step < 2 ? 'Next' : 'Start Chatting'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}
