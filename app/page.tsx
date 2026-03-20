'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const NAV_LINKS = ['Features', 'How It Works', 'Modes', 'FAQ']

const FEATURES = [
    {
        icon: '⬡',
        title: 'Structured Academic Answers',
        desc: 'Every response follows Definition → Explanation → Key Points → Example → Summary. No more messy, incomplete outputs.',
        accent: '#00FFB2',
    },
    {
        icon: '◈',
        title: 'Smart Learning Modes',
        desc: 'Switch between General Learning Mode for any subject and Cybersecurity Mode for specialized, deep-dive security content.',
        accent: '#0099FF',
    },
    {
        icon: '◉',
        title: 'Context-Aware AI Engine',
        desc: 'Our routing system selects the right model per query — fast for simple questions, powerful for complex ones.',
        accent: '#FF6B6B',
    },
    {
        icon: '◬',
        title: 'Exam-Ready Outputs',
        desc: 'Toggle Exam Mode for concise, exam-style answers. CyberAI structures learning so you retain and recall better.',
        accent: '#FFD700',
    },
    {
        icon: '⬡',
        title: 'Diagram Generation',
        desc: 'Ask about OS, Networks, DBMS, or Cybersecurity — CyberAI auto-generates visual diagrams when needed.',
        accent: '#B06EFF',
    },
    {
        icon: '◈',
        title: 'Multi-Domain Coverage',
        desc: 'BCA, BSc IT, Data Science, Cybersecurity. One platform, every subject. Your AI study partner for all semesters.',
        accent: '#00FFB2',
    },
]

const PROBLEMS = [
    'Scattered notes across 5 apps',
    'ChatGPT gives unstructured walls of text',
    'No exam-focused formatting',
    'Switching tools for diagrams',
]

const SOLUTIONS = [
    'One structured platform for all subjects',
    'Definition → Explanation → Example → Summary',
    'Exam Mode built right in',
    'Auto-generated diagrams in chat',
]

const DOMAINS = ['BCA', 'BSc IT', 'Data Science', 'Cybersecurity', 'Networks', 'DBMS', 'OS', 'Web Dev']

function TypeWriter({ text, speed = 35 }: { text: string; speed?: number }) {
    const [displayed, setDisplayed] = useState('')
    const [idx, setIdx] = useState(0)
    useEffect(() => {
        if (idx < text.length) {
            const t = setTimeout(() => {
                setDisplayed(p => p + text[idx])
                setIdx(i => i + 1)
            }, speed)
            return () => clearTimeout(t)
        }
    }, [idx, text, speed])
    return (
        <span>
            {displayed}
            <span style={{ animation: 'blink 1s step-end infinite', opacity: idx < text.length ? 1 : 0 }}>|</span>
        </span>
    )
}

export default function LandingPage() {
    const { isSignedIn, user } = useUser()
    const router = useRouter()
    const [scrolled, setScrolled] = useState(false)
    const [activeMode, setActiveMode] = useState<'learning' | 'cyber'>('learning')

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div style={{ background: '#060810', color: '#E8EAF0', minHeight: '100vh', fontFamily: 'var(--font-dm-sans), sans-serif', overflowX: 'hidden' }}>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-30px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,20px)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(0,255,178,0.2)} 50%{box-shadow:0 0 40px rgba(0,255,178,0.5)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .nav-link { color:rgba(232,234,240,0.5); font-size:14px; text-decoration:none; transition:color 0.2s; cursor:pointer; }
        .nav-link:hover { color:#00FFB2; }
        .btn-primary { background:linear-gradient(135deg,#00FFB2,#0099FF); color:#060810; font-weight:700; border:none; border-radius:6px; padding:12px 28px; cursor:pointer; font-size:15px; font-family:var(--font-space-mono),monospace; transition:all 0.2s; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,255,178,0.3); }
        .btn-ghost { background:transparent; color:rgba(232,234,240,0.7); border:1px solid rgba(232,234,240,0.15); border-radius:6px; padding:11px 24px; cursor:pointer; font-size:14px; transition:all 0.2s; }
        .btn-ghost:hover { border-color:#00FFB2; color:#00FFB2; }
        .feature-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:32px; transition:all 0.3s; }
        .feature-card:hover { background:rgba(255,255,255,0.04); border-color:rgba(0,255,178,0.2); transform:translateY(-4px); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:rgba(0,255,178,0.3); border-radius:2px; }
      `}</style>

            {/* Background grid */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(0,255,178,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,178,0.03) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

            {/* Orbs */}
            <div style={{ position: 'fixed', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,255,178,0.08) 0%,transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0, animation: 'orbFloat1 8s ease-in-out infinite' }} />
            <div style={{ position: 'fixed', top: '50%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,153,255,0.07) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0, animation: 'orbFloat2 11s ease-in-out infinite' }} />

            {/* Scanline */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(transparent,rgba(0,255,178,0.1),transparent)', animation: 'scanline 8s linear infinite', pointerEvents: 'none', zIndex: 1 }} />

            {/* ── NAV ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '0 48px', height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(6,8,16,0.92)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
                transition: 'all 0.3s',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, border: '2px solid #00FFB2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'glowPulse 3s ease-in-out infinite' }}>
                        <span style={{ color: '#00FFB2', fontSize: 14, fontFamily: 'var(--font-space-mono),monospace', fontWeight: 700 }}>C</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
                        Cyber<span style={{ color: '#00FFB2' }}>AI</span>
                    </span>
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: 36 }}>
                    {NAV_LINKS.map(l => <span key={l} className="nav-link">{l}</span>)}
                </div>

                {/* Auth */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {isSignedIn ? (
                        <>
                            <span style={{ fontSize: 13, color: 'rgba(232,234,240,0.5)', fontFamily: 'var(--font-space-mono)' }}>
                                {user?.firstName}
                            </span>
                            <button className="btn-primary" onClick={() => router.push('/chat')}>
                                Open App →
                            </button>
                        </>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <button className="btn-ghost">Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal" forceRedirectUrl="/chat">
                                <button className="btn-primary">Get Started →</button>
                            </SignUpButton>
                        </>
                    )}
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px', position: 'relative', zIndex: 1 }}>
                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,178,0.08)', border: '1px solid rgba(0,255,178,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 32 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FFB2', animation: 'pulse 2s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#00FFB2', letterSpacing: 2, textTransform: 'uppercase' }}>
                        AI Learning Platform
                    </span>
                </div>

                {/* Headline */}
                <h1 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 'clamp(42px,7vw,88px)', lineHeight: 1.05, letterSpacing: -2, maxWidth: 900, marginBottom: 24 }}>
                    AI Learning +<br />
                    <span style={{ background: 'linear-gradient(135deg,#00FFB2 0%,#0099FF 50%,#B06EFF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Cybersecurity
                    </span><br />
                    Assistant
                </h1>

                <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 15, color: 'rgba(0,255,178,0.7)', marginBottom: 16, minHeight: 24 }}>
                    <TypeWriter text="$ solving scattered learning, one structured answer at a time" />
                </div>

                <p style={{ fontSize: 17, color: 'rgba(232,234,240,0.5)', maxWidth: 560, lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>
                    Structured exam-ready answers across BCA, BSc IT, Data Science, and Cybersecurity.
                    Built for students who need clarity, not noise.
                </p>

                {/* CTA */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {isSignedIn ? (
                        <button className="btn-primary" onClick={() => router.push('/chat')} style={{ fontSize: 16, padding: '14px 36px' }}>
                            Open CyberAI →
                        </button>
                    ) : (
                        <SignUpButton mode="modal" forceRedirectUrl="/chat">
                            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
                                Try Now — It's Free
                            </button>
                        </SignUpButton>
                    )}
                    <button className="btn-ghost" style={{ padding: '14px 28px' }}>Watch Demo ▷</button>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 48, marginTop: 72, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[['10+', 'Subjects Covered'], ['4', 'Learning Modes'], ['100%', 'Structured Output']].map(([val, label]) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 32, color: '#00FFB2' }}>{val}</div>
                            <div style={{ fontSize: 13, color: 'rgba(232,234,240,0.4)', marginTop: 4 }}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Scroll cue */}
                <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 10, color: 'rgba(232,234,240,0.25)', letterSpacing: 3, textTransform: 'uppercase' }}>scroll</span>
                    <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,rgba(0,255,178,0.4),transparent)' }} />
                </div>
            </section>

            {/* ── TICKER ── */}
            <div style={{ overflow: 'hidden', padding: '12px 0', borderTop: '1px solid rgba(0,255,178,0.1)', borderBottom: '1px solid rgba(0,255,178,0.1)', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', gap: 48, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
                    {[...DOMAINS, ...DOMAINS].map((d, i) => (
                        <span key={i} style={{ fontSize: 13, fontFamily: 'var(--font-space-mono),monospace', color: 'rgba(0,255,178,0.5)', letterSpacing: 3, textTransform: 'uppercase' }}>
                            {d} <span style={{ color: 'rgba(0,255,178,0.2)' }}>◆</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── PROBLEM → SOLUTION ── */}
            <section style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#00FFB2', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>The Problem</div>
                    <h2 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1 }}>
                        Students deserve better than<br />scattered, messy AI answers
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,107,107,0.04)', border: '1px solid rgba(255,107,107,0.12)', borderRadius: 16, padding: 36 }}>
                        <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#FF6B6B', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>Before CyberAI</div>
                        {PROBLEMS.map((p, i) => (
                            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                                <span style={{ color: '#FF6B6B', fontWeight: 700, flexShrink: 0 }}>✕</span>
                                <span style={{ fontSize: 15, color: 'rgba(232,234,240,0.6)', lineHeight: 1.5 }}>{p}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#00FFB2,#0099FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>→</div>
                    <div style={{ background: 'rgba(0,255,178,0.04)', border: '1px solid rgba(0,255,178,0.12)', borderRadius: 16, padding: 36 }}>
                        <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#00FFB2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>With CyberAI</div>
                        {SOLUTIONS.map((s, i) => (
                            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                                <span style={{ color: '#00FFB2', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                <span style={{ fontSize: 15, color: 'rgba(232,234,240,0.8)', lineHeight: 1.5 }}>{s}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#0099FF', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Features</div>
                    <h2 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1 }}>
                        Everything a student needs.<br />Nothing they don't.
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div style={{ fontSize: 28, color: f.accent, marginBottom: 16 }}>{f.icon}</div>
                            <h3 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: 'rgba(232,234,240,0.5)', lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── MODES DEMO ── */}
            <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#B06EFF', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Adaptive Modes</div>
                    <h2 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1 }}>One AI, two powerful modes</h2>
                </div>

                {/* Mode tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 4 }}>
                        {(['learning', 'cyber'] as const).map(m => (
                            <button key={m} onClick={() => setActiveMode(m)} style={{
                                padding: '8px 24px', borderRadius: 6, fontSize: 13, border: '1px solid',
                                fontFamily: 'var(--font-space-mono),monospace', cursor: 'pointer', transition: 'all 0.25s',
                                background: activeMode === m ? (m === 'learning' ? 'rgba(0,255,178,0.15)' : 'rgba(255,107,107,0.15)') : 'transparent',
                                color: activeMode === m ? (m === 'learning' ? '#00FFB2' : '#FF6B6B') : 'rgba(232,234,240,0.4)',
                                borderColor: activeMode === m ? (m === 'learning' ? 'rgba(0,255,178,0.3)' : 'rgba(255,107,107,0.3)') : 'transparent',
                            }}>
                                {m === 'learning' ? '🟢 Learning Mode' : '🔴 Cyber Mode'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mock chat */}
                <div style={{ maxWidth: 680, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: `1px solid ${activeMode === 'learning' ? 'rgba(0,255,178,0.15)' : 'rgba(255,107,107,0.15)'}`, borderRadius: 20, overflow: 'hidden', transition: 'border-color 0.3s' }}>
                    <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                        </div>
                        <span style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: 'rgba(232,234,240,0.3)' }}>
                            cyberai — {activeMode === 'learning' ? 'learning_mode' : 'cyber_mode'}
                        </span>
                    </div>
                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                            <div style={{ background: activeMode === 'learning' ? 'rgba(0,255,178,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${activeMode === 'learning' ? 'rgba(0,255,178,0.2)' : 'rgba(255,107,107,0.2)'}`, borderRadius: '16px 16px 4px 16px', padding: '10px 16px', maxWidth: '70%', fontSize: 14 }}>
                                {activeMode === 'learning' ? 'Explain normalization in DBMS' : 'What is a SQL injection attack?'}
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px 16px 16px 16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, color: 'rgba(232,234,240,0.75)', lineHeight: 1.8 }}>
                            <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: activeMode === 'learning' ? '#00FFB2' : '#FF6B6B', marginBottom: 12 }}>
                                ◉ CyberAI · {activeMode === 'learning' ? 'Learning Mode' : 'Cyber Mode'}
                            </div>
                            {activeMode === 'learning' ? (
                                <>
                                    <div style={{ marginBottom: 8 }}><span style={{ color: '#00FFB2' }}>📌 Definition</span><br />Normalization organizes a relational DB to reduce redundancy and improve integrity.</div>
                                    <div style={{ marginBottom: 8 }}><span style={{ color: '#0099FF' }}>⚡ Key Points</span><br />• 1NF: Atomic values &nbsp;• 2NF: No partial deps &nbsp;• 3NF: No transitive deps</div>
                                    <div><span style={{ color: '#FFD700' }}>🎯 Exam Summary</span><br />Normalization = eliminate redundancy through 1NF→2NF→3NF decomposition.</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ marginBottom: 8 }}><span style={{ color: '#FF6B6B' }}>🔴 Attack Vector</span><br />SQL Injection inserts malicious SQL via unvalidated input to manipulate queries.</div>
                                    <div style={{ marginBottom: 8 }}><span style={{ color: '#B06EFF' }}>💀 Example</span><br /><code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4 }}>' OR '1'='1</code> — bypasses login</div>
                                    <div><span style={{ color: '#00FFB2' }}>🛡 Prevention</span><br />Use parameterized queries + input sanitization + WAF.</div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section style={{ padding: '100px 48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 700, margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,255,178,0.12)', borderRadius: 24, padding: '64px 48px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(0,255,178,0.05) 0%,transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: '#00FFB2', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 20 }}>Get Early Access</div>
                    <h2 style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: -1, marginBottom: 20 }}>Ready to learn smarter?</h2>
                    <p style={{ fontSize: 16, color: 'rgba(232,234,240,0.5)', marginBottom: 40, lineHeight: 1.7 }}>
                        Join students getting structured, exam-ready answers.<br />Free during beta. No credit card required.
                    </p>
                    {isSignedIn ? (
                        <button className="btn-primary" onClick={() => router.push('/chat')} style={{ fontSize: 16, padding: '16px 44px' }}>
                            Go to Dashboard →
                        </button>
                    ) : (
                        <SignUpButton mode="modal" forceRedirectUrl="/chat">
                            <button className="btn-primary" style={{ fontSize: 16, padding: '16px 44px' }}>
                                Start Learning Free →
                            </button>
                        </SignUpButton>
                    )}
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 48px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, border: '2px solid rgba(0,255,178,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#00FFB2', fontSize: 12, fontFamily: 'var(--font-space-mono),monospace', fontWeight: 700 }}>C</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-syne),sans-serif', fontWeight: 800, fontSize: 18 }}>Cyber<span style={{ color: '#00FFB2' }}>AI</span></span>
                    </div>
                    <div style={{ display: 'flex', gap: 32 }}>
                        {['Privacy', 'Terms', 'Contact'].map(l => (
                            <span key={l} style={{ fontSize: 13, color: 'rgba(232,234,240,0.3)', cursor: 'pointer' }}>{l}</span>
                        ))}
                    </div>
                    <div style={{ fontFamily: 'var(--font-space-mono),monospace', fontSize: 11, color: 'rgba(232,234,240,0.2)' }}>
                        © 2025 CyberAI · Built for students
                    </div>
                </div>
            </footer>
        </div>
    )
}