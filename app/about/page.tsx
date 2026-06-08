'use client'
import { motion } from 'framer-motion'
import { Shield, GraduationCap, Target, Sparkles, ArrowUpRight } from 'lucide-react'
import NetworkBackground from '@/components/NetworkBackground'

const TEAM = [
  { name: 'Vatsal Trivedi', role: 'Founder & Product', avatar: 'VT', bio: 'Saw the gap in how cybersecurity was being taught. Built SENTINEL to bridge learning and operations.' },
  { name: 'Rajeshwar', role: 'Backend Engineer', avatar: 'RJ', bio: 'Built the infrastructure from AI routing to SOC module architecture and data layer.' },
  { name: 'Bhushan', role: 'Frontend Engineer', avatar: 'BH', bio: 'Crafted the interfaces — from student learning to SOC triage — fast, intuitive, and premium.' },
  { name: 'Makran', role: 'Frontend & Research', avatar: 'MK', bio: 'Bridges research and product. Explores how both students and analysts interact with AI.' },
]

const TIMELINE = [
  { year: '2024', title: 'The idea', desc: 'No tool existed that could explain any subject clearly and also serve as a security operations assistant.' },
  { year: 'Q1 2025', title: 'Learning prototype built', desc: 'AI tutoring chatbot that could answer questions on any topic. Shared with 20 classmates.' },
  { year: 'Q2 2025', title: 'AETHER v1 launched', desc: 'Full learning platform with auth, chat history, multiple subjects, and smart AI routing.' },
  { year: 'Q3 2025', title: 'SOC Suite added', desc: 'Built-in SOC tools — alert triage, threat intel, IR, forensics — transforming it into a dual-purpose platform.' },
  { year: 'Today', title: 'Growing fast', desc: 'Used by students to learn anything and by SOC teams to respond faster. Continuously improving.' },
]

const VALUES = [
  { icon: GraduationCap, title: 'Learn Anything', desc: 'AI tutoring across every subject — math, science, programming, languages, cybersecurity, and more.' },
  { icon: Shield, title: 'Defend Everything', desc: 'Built-in SOC suite for alert triage, threat intelligence, incident response, and forensics.' },
  { icon: Sparkles, title: 'AI-Native', desc: 'Intelligent model routing selects the best AI for each query — fast for simple, deep for complex.' },
  { icon: Target, title: 'Student-First', desc: 'Free tier, no credit card, CTF challenges, and structured learning paths from beginner to SOC-ready.' },
]

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-primary)' }}>
      <NetworkBackground />

      <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>S</div>
            <span className="text-sm font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
          </a>
          <div className="flex items-center gap-2.5">
            <a href="/" className="btn-ghost text-sm">Home</a>
            <a href="/chat" className="btn-primary text-xs h-8 px-4 gap-1.5">
              Open App <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-16 px-6" style={{ zIndex: 1 }}>
        <motion.div className="max-w-2xl mx-auto text-center" {...fadeUp}>
          <p className="text-xs tracking-widest uppercase mb-3"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>About Us</p>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            One platform.<br />
            <span style={{ color: 'var(--accent)' }}>Two missions.</span>
          </h1>
          <p className="text-sm max-w-lg mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            SENTINEL is an AI-native platform built by students who wanted to fix two problems: learning any subject shouldn&apos;t be hard, and cybersecurity tools shouldn&apos;t be out of reach.
          </p>
        </motion.div>
      </section>

      <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <motion.div className="p-8 rounded-xl border" {...fadeUp} transition={{ delay: 0.1 }}
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <p className="text-xs tracking-widest uppercase mb-3"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Why we built it</p>
            <h2 className="text-xl font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Learning was broken. Security tools were worse.</h2>
            <div className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>Students spend hours searching for clear explanations. SOC analysts juggle a dozen tools just to triage one alert.</p>
              <p>We saw classmates struggle with exams and security teams burn out on manual workflows. Both problems came from the same root: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>no AI-native platform designed for how people actually work.</span></p>
              <p className="font-medium" style={{ color: 'var(--accent)' }}>So we built one platform for both.</p>
            </div>
          </motion.div>

          <motion.div className="space-y-3" {...fadeUp} transition={{ delay: 0.2 }}>
            {VALUES.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={i} className="p-4 rounded-xl border flex gap-3 items-start transition-all hover:translate-y-[-1px]"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-subtle)' }}>
                    <Icon size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{v.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{v.desc}</div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="relative px-6 pb-16" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-10" {...fadeUp}>
            <p className="text-xs tracking-widest uppercase mb-2"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Our Journey</p>
            <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>How we got here</h2>
          </motion.div>
          <div className="space-y-0">
            {TIMELINE.map((t, i) => (
              <motion.div key={i} className="flex gap-6" {...fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="flex flex-col items-center flex-shrink-0 w-20">
                  <div className="text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}>{t.year}</div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 mt-2" style={{ background: 'var(--border)' }} />}
                </div>
                <div className="p-5 rounded-xl border flex-1 mb-4"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 pb-24" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-10" {...fadeUp}>
            <p className="text-xs tracking-widest uppercase mb-2"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>The Team</p>
            <h2 className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>Built by students, for everyone</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4">
            {TEAM.map((m, i) => (
              <motion.div key={i} className="p-5 rounded-xl border text-center" {...fadeUp} transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-medium"
                  style={{ background: 'var(--accent-subtle)', border: '2px solid var(--accent)', color: 'var(--accent)' }}>
                  {m.avatar}
                </div>
                <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                <div className="text-[10px] font-medium mb-2" style={{ color: 'var(--accent)' }}>{m.role}</div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{m.bio}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative px-6 pb-10 text-center" style={{ zIndex: 1 }}>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          SENTINEL — AI Learning Platform + SOC Suite
        </p>
      </footer>
    </div>
  )
}
