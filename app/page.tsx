'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Search, Siren, FileSearch, Terminal, FileText, GraduationCap, BookOpen, Target, Brain, FlaskConical, Sparkles } from 'lucide-react'
import NetworkBackground from '@/components/NetworkBackground'

const FEATURES = [
  { icon: Brain, title: 'Learning Agent', desc: 'Step-by-step explanations, exam prep, and personalized tutoring across any subject.' },
  { icon: FlaskConical, title: 'Research Agent', desc: 'Deep dives, citations, comparisons, and academic analysis on any topic.' },
  { icon: Sparkles, title: 'Study Tools', desc: 'AI-generated flashcards, summaries, practice questions, and study plans.' },
  { icon: Siren, title: 'Alert Triage', desc: 'Classify and prioritize security alerts with AI-assisted analysis.' },
  { icon: Search, title: 'Threat Intelligence', desc: 'Investigate IOCs, map TTPs to MITRE ATT&CK, profile threat actors.' },
  { icon: Shield, title: 'Incident Response', desc: 'Guided playbooks, containment steps, evidence collection — AI-assisted.' },
  { icon: FileSearch, title: 'Digital Forensics', desc: 'Timeline analysis, artifact collection, root cause investigation.' },
  { icon: Terminal, title: 'SIEM Queries', desc: 'Natural language to Splunk, KQL, Elastic queries in seconds.' },
  { icon: FileText, title: 'Reporting', desc: 'Post-incident reports with executive summaries and technical findings.' },
]

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => { if (isSignedIn) router.push('/chat') }, [isSignedIn, router])

  return (
    <div className="min-h-screen" style={{ maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-secondary)' }}>
      <NetworkBackground />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md overflow-hidden"
        style={{ background: 'rgba(34,34,32,0.7)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/about" className="btn-ghost text-sm">About</a>
            <a href="/blog" className="btn-ghost text-sm">Blog</a>
            <SignInButton mode="modal">
              <button className="btn-ghost text-sm">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-primary text-sm">Get Started</button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs mb-6"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
              AI Learning Platform + Built-in SOC Suite — v0.1
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
            <h1 className="text-[44px] md:text-6xl font-medium tracking-tight mb-4 leading-[1.15]"
              style={{ color: 'var(--text-primary)' }}>
              Learn Anything.<br />
              <span style={{ color: 'var(--accent)' }}>Defend Everything.</span>
            </h1>
            <p className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}>
              An AI-powered platform for learning any subject — plus a complete SOC toolkit for cybersecurity. Study smarter. Investigate faster. All in one place.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-3">
            <button className="btn-primary h-10 px-6 text-sm" onClick={() => setShowAuth(true)}>
              Start Learning Free
            </button>
            <a href="/about" className="btn-ghost h-10 px-5 text-sm">How It Works</a>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-6 mt-10 text-xs"
            style={{ color: 'var(--text-tertiary)' }}>
            <span>Free for students</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>50 free queries/day</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>No credit card</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
            <span>Any subject</span>
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 pb-32" style={{ zIndex: 1 }}>
        <motion.div className="max-w-6xl mx-auto"
          variants={stagger} initial="initial" whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-xs tracking-widest uppercase mb-2"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              Platform Capabilities
            </p>
            <h2 className="text-2xl font-medium" style={{ color: 'var(--text-primary)' }}>
              Learn. Research. Defend.
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Three learning agents for any subject + six SOC modules for cybersecurity.
            </p>
          </motion.div>

          <div className="mb-8">
            <p className="text-xs font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <Brain size={14} /> General Learning
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {FEATURES.slice(0, 3).map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div key={i} variants={fadeUp}
                    className="p-5 rounded-xl border transition-all duration-200 hover:translate-y-[-2px]"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: 'var(--accent-subtle)' }}>
                      <Icon size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium mb-3 flex items-center gap-2"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <Shield size={14} /> SOC Suite
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {FEATURES.slice(3).map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div key={i} variants={fadeUp}
                    className="p-5 rounded-xl border transition-all duration-200 hover:translate-y-[-2px]"
                    style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: 'var(--accent-subtle)' }}>
                      <Icon size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{f.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="relative px-6 pb-32" style={{ zIndex: 1 }}>
        <motion.div className="max-w-4xl mx-auto rounded-2xl border p-10 md:p-14 text-center"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          <p className="text-xs tracking-widest uppercase mb-2"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            Two Platforms. One Account.
          </p>
          <h2 className="text-xl md:text-2xl font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Use it for anything. Master cybersecurity with the SOC suite.
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <GraduationCap size={14} style={{ color: 'var(--accent)' }} />
                Learning Platform
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Learn any subject with AI tutoring, research deep-dives, and smart study tools. Math, science, history, programming, languages — you name it.
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <h3 className="text-sm font-medium mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Shield size={14} style={{ color: 'var(--accent)' }} />
                SOC Suite
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                Built-in cybersecurity tools: alert triage, threat intel, incident response, forensics, SIEM queries, and reporting — all AI-assisted.
              </p>
            </div>
          </div>
          <button className="btn-primary h-10 px-7 text-sm" onClick={() => setShowAuth(true)}>
            Start Free — No Credit Card
          </button>
        </motion.div>
      </section>

      <footer className="relative px-6 pb-8 text-center" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>SENTINEL</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          AI Learning Platform + SOC Suite
        </p>
      </footer>

      <AnimatePresence>
        {showAuth && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAuth(false)} />
            <motion.div className="relative w-full max-w-[420px] rounded-2xl p-10 border text-center"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <button onClick={() => setShowAuth(false)} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md btn-ghost">
                <X size={14} />
              </button>
              <Shield size={24} style={{ color: 'var(--accent)' }} className="mx-auto mb-3" />
              <span className="text-lg font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Learn any subject. Defend with SOC tools. Free for students.
              </p>
              <SignUpButton mode="modal">
                <button className="btn-primary w-full justify-center mb-3">Create Free Account</button>
              </SignUpButton>
              <div className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>already have an account?</div>
              <SignInButton mode="modal">
                <button className="btn-secondary w-full justify-center">Sign In</button>
              </SignInButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
