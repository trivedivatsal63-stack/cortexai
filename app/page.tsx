'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'

export default function LandingPage() {
    const { isSignedIn } = useUser()
    const router = useRouter()
    const [showAuth, setShowAuth] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (isSignedIn) router.push('/chat')
    }, [isSignedIn, router])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="root">
            {/* Ambient background */}
            <div className="bg-blob bg-blob-1" />
            <div className="bg-blob bg-blob-2" />
            <div className="bg-blob bg-blob-3" />

            {/* ── NAV ── */}
            <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
                <div className="nav-inner">
                    <div className="nav-logo">
                        <Image src="/cortex-icon.png" alt="CortexAI" width={24} height={24} />
                        <span className="nav-logo-text">CortexAI</span>
                    </div>
                    <div className="nav-links">
                        <SignInButton mode="modal">
                            <button className="nav-link">Sign In</button>
                        </SignInButton>
                        <a href="/about" className="nav-link">About</a>
                        <a href="/blog" className="nav-link">Blog & Suggest</a>
                        <SignUpButton mode="modal">
                            <button className="nav-cta">Get Started</button>
                        </SignUpButton>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    Now in Beta · Free for Students
                </div>

                <h1 className="hero-title">
                    Your AI Learning<br />
                    <span className="hero-gradient">Companion</span>
                </h1>

                <p className="hero-sub">
                    Learn faster. Understand deeper. Prepare better.<br />
                    CortexAI helps you understand any subject, prepare for exams,<br />
                    and study smarter — all in one place.
                </p>

                <div className="hero-actions">
                    <button className="btn-primary" onClick={() => setShowAuth(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        Start Learning Free
                    </button>
                    <button className="btn-secondary" onClick={() => alert('Download app coming soon! 🚀')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Download App
                        <span className="btn-chip">Soon</span>
                    </button>
                </div>

                <div className="hero-social">
                    <div className="social-stat"><span className="social-num">2,000+</span><span className="social-label">Students</span></div>
                    <div className="social-div" />
                    <div className="social-stat"><span className="social-num">50K+</span><span className="social-label">Questions Answered</span></div>
                    <div className="social-div" />
                    <div className="social-stat"><span className="social-num">A+</span><span className="social-label">Rated by Students</span></div>
                </div>
            </section>

            {/* ── WHY WE BUILT THIS ── */}
            <section className="section">
                <div className="section-inner">
                    <div className="section-label">The Problem</div>
                    <h2 className="section-title">Learning is harder than it should be</h2>
                    <p className="section-sub">We were students too. We know exactly how painful it is.</p>

                    <div className="problems-grid">
                        {[
                            { icon: '📚', title: 'Textbooks are overwhelming', desc: 'Dense, outdated, and written for experts — not students trying to pass an exam or understand a concept for the first time.' },
                            { icon: '🔍', title: 'Google gives conflicting answers', desc: 'You search a topic and get hundreds of blog posts, tutorials, and videos — none of which actually explain it clearly.' },
                            { icon: '⏰', title: 'Exam season is stressful', desc: 'You have an exam in a few days and no structured way to revise. No summaries, no key points, no focused study material.' },
                            { icon: '🧩', title: 'Concepts feel disconnected', desc: 'You learn something but never understand where it fits in the bigger picture. Pieces never quite come together.' },
                        ].map((p, i) => (
                            <div key={i} className="problem-card" style={{ animationDelay: `${i * 0.08}s` }}>
                                <div className="problem-icon">{p.icon}</div>
                                <div className="problem-title">{p.title}</div>
                                <div className="problem-desc">{p.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHAT CortexAI DOES ── */}
            <section className="section section-alt">
                <div className="section-inner">
                    <div className="section-label">The Solution</div>
                    <h2 className="section-title">Learn anything. Understand everything.</h2>
                    <p className="section-sub">CortexAI doesn't just answer questions — it teaches.</p>

                    <div className="features-grid">
                        {[
                            { icon: '🎯', color: '#7c6af7', title: 'Exam-Ready Explanations', desc: 'Every answer includes definitions, step-by-step breakdowns, key points, and exam summaries. Built for revision.' },
                            { icon: '💻', color: '#4f8ef7', title: 'Programming Help', desc: 'From C++ to Python, get clear code examples with explanations tailored to your level.' },
                            { icon: '🔬', color: '#10b981', title: 'Any Subject', desc: 'Computer Science, Mathematics, Physics, and more. Learn any topic with structured explanations.' },
                            { icon: '🧠', color: '#f59e0b', title: 'Smart AI Routing', desc: 'Your query is automatically routed to the right AI model. Simple questions get instant answers. Complex topics get deep dives.' },
                            { icon: '📖', color: '#ec4899', title: 'Note Generation', desc: 'Ask CortexAI to generate study notes on any topic. Structured, concise, and exam-focused — ready to revise from.' },
                            { icon: '🔍', color: '#22d3ee', title: 'Research Helper', desc: 'Understand complex concepts, explore topics deeply, and get clear explanations for any subject.' },
                        ].map((f, i) => (
                            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.07}s` }}>
                                <div className="feature-icon" style={{ background: `${f.color}18` }}>{f.icon}</div>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-inner">
                    <div className="orb-wrap">
                        <div className="orb-blur" />
                        <div className="orb" />
                    </div>
                    <h2 className="cta-title">Ready to learn smarter?</h2>
                    <p className="cta-sub">Join thousands of students who use CortexAI to study better, prepare faster, and understand deeper.</p>
                    <div className="cta-btns">
                        <button className="btn-primary" onClick={() => setShowAuth(true)}>
                            Start Learning Free →
                        </button>
                        <a href="/about" className="btn-ghost">Meet the Team</a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-logo">
                        <Image src="/cortex-icon.png" alt="CortexAI" width={18} height={18} style={{ opacity: 0.9 }} />
                        <span style={{ fontWeight: 700, color: '#f0f0f5', opacity: 0.9 }}>CortexAI</span>
                    </div>
                    <div className="footer-links">
                        <a href="/about">About</a>
                        <a href="/blog">Blog</a>
                        <a href="/pricing">Pricing</a>
                        <a href="/chat">App</a>
                    </div>
                    <div className="footer-copy">© 2025 CortexAI. Built for students, by students.</div>
                </div>
            </footer>

            {/* ── AUTH MODAL ── */}
            {showAuth && (
                <>
                    <div className="modal-backdrop" onClick={() => setShowAuth(false)} />
                    <div className="auth-modal">
                        <button className="modal-close" onClick={() => setShowAuth(false)}>✕</button>
                        <Image src="/cortex-icon.png" alt="CortexAI" width={48} height={48} className="auth-orb" />
                        <h3 className="auth-title">Join CortexAI</h3>
                        <p className="auth-sub">Free for students. Start learning in seconds.</p>
                        <SignUpButton mode="modal">
                            <button className="auth-btn-primary">Create Free Account</button>
                        </SignUpButton>
                        <div className="auth-divider"><span>already have an account?</span></div>
                        <SignInButton mode="modal">
                            <button className="auth-btn-secondary">Sign In</button>
                        </SignInButton>
                    </div>
                </>
            )}

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Outfit', sans-serif; background: #0c0c0f; color: #f0f0f5; overflow-x: hidden; }

        @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes orb-glow { 0%,100%{box-shadow:0 0 60px rgba(150,120,255,.4)} 50%{box-shadow:0 0 100px rgba(180,140,255,.6)} }
        @keyframes blob-drift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(0.97)} }
        @keyframes badge-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes card-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* Background */
        .root { position: relative; min-height: 100vh; }
        .bg-blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; animation: blob-drift 18s ease-in-out infinite; }
        .bg-blob-1 { width: 500px; height: 500px; top: -150px; left: -100px; background: rgba(124,106,247,0.12); }
        .bg-blob-2 { width: 400px; height: 400px; top: 40%; right: -100px; background: rgba(79,142,247,0.1); animation-delay: -6s; }
        .bg-blob-3 { width: 350px; height: 350px; bottom: 10%; left: 20%; background: rgba(139,92,246,0.08); animation-delay: -12s; }

        /* Nav */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all .3s; padding: 0; }
        .nav-scrolled { background: rgba(12,12,15,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 18px 32px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }

        .nav-logo-text { font-size: 18px; font-weight: 700; color: #f0f0f5; }
        .nav-links { display: flex; align-items: center; gap: 6px; }
        .nav-link { background: none; border: none; font-family: inherit; font-size: 14px; color: #8a8a9a; cursor: pointer; padding: 7px 14px; border-radius: 8px; transition: all .15s; text-decoration: none; display: inline-flex; }
        .nav-link:hover { background: rgba(255,255,255,0.05); color: #f0f0f5; }
        .nav-cta { background: linear-gradient(135deg,#7c6af7,#4f8ef7); border: none; font-family: inherit; font-size: 13.5px; font-weight: 600; color: #fff; padding: 8px 20px; border-radius: 20px; cursor: pointer; transition: all .2s; box-shadow: 0 0 20px rgba(124,106,247,0.35); }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 0 28px rgba(124,106,247,0.55); }

        /* Hero */
        .hero { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 32px 80px; animation: fadein .6s ease both; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 20px; background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.25); font-size: 13px; color: #c4b5fd; margin-bottom: 28px; }
        .hero-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #7c6af7; box-shadow: 0 0 8px #7c6af7; animation: badge-pulse 2s ease-in-out infinite; }
        .hero-title { font-size: clamp(36px, 6vw, 68px); font-weight: 900; letter-spacing: -.04em; line-height: 1.05; color: #f0f0f5; margin-bottom: 22px; }
        .hero-gradient { background: linear-gradient(135deg, #c4b5fd, #818cf8, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: clamp(15px,2vw,18px); color: #8a8a9a; line-height: 1.7; margin-bottom: 40px; max-width: 600px; }
        .hero-actions { display: flex; gap: 12px; margin-bottom: 48px; flex-wrap: wrap; justify-content: center; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg,#7c6af7,#4f8ef7); color: #fff; font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; box-shadow: 0 0 28px rgba(124,106,247,.4); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(124,106,247,.6); }
        .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #f0f0f5; font-family: inherit; font-size: 15px; font-weight: 500; cursor: pointer; transition: all .2s; position: relative; }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-1px); }
        .btn-chip { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; background: rgba(124,106,247,0.2); border: 1px solid rgba(124,106,247,0.3); color: #c4b5fd; border-radius: 4px; padding: 2px 6px; }
        .btn-ghost { display: inline-flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: none; color: #8a8a9a; font-family: inherit; font-size: 14px; text-decoration: none; transition: all .2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #f0f0f5; }
        .hero-social { display: flex; align-items: center; gap: 24px; }
        .social-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .social-num { font-size: 22px; font-weight: 700; color: #f0f0f5; }
        .social-label { font-size: 12px; color: #44445a; }
        .social-div { width: 1px; height: 36px; background: rgba(255,255,255,0.08); }

        /* Sections */
        .section { position: relative; z-index: 1; padding: 96px 32px; }
        .section-alt { background: rgba(255,255,255,0.015); }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #7c6af7; margin-bottom: 14px; }
        .section-title { font-size: clamp(28px,4vw,44px); font-weight: 800; letter-spacing: -.03em; color: #f0f0f5; margin-bottom: 14px; }
        .section-sub { font-size: 16px; color: #8a8a9a; margin-bottom: 56px; max-width: 500px; }

        /* Problems grid */
        .problems-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
        .problem-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: all .2s; animation: card-in .5s ease both; }
        .problem-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,106,247,0.2); transform: translateY(-2px); }
        .problem-icon { font-size: 28px; margin-bottom: 12px; }
        .problem-title { font-size: 16px; font-weight: 600; color: #f0f0f5; margin-bottom: 8px; }
        .problem-desc { font-size: 14px; color: #8a8a9a; line-height: 1.7; }

        /* Features grid */
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .feature-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: all .2s; animation: card-in .5s ease both; }
        .feature-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,106,247,0.25); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
        .feature-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
        .feature-title { font-size: 15px; font-weight: 600; color: #f0f0f5; margin-bottom: 8px; }
        .feature-desc { font-size: 13.5px; color: #8a8a9a; line-height: 1.7; }

        /* CTA */
        .cta-section { position: relative; z-index: 1; padding: 96px 32px; text-align: center; }
        .cta-inner { max-width: 600px; margin: 0 auto; }
        .orb-wrap { position: relative; width: 80px; height: 80px; margin: 0 auto 28px; animation: orb-float 5s ease-in-out infinite; }
        .orb-blur { position: absolute; inset: -20px; border-radius: 50%; background: radial-gradient(circle,rgba(150,120,255,.22),transparent 70%); filter: blur(14px); }
        .orb { width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(from 180deg,#c084fc,#818cf8,#60a5fa,#34d399,#fbbf24,#f472b6,#c084fc); animation: orb-glow 4s ease-in-out infinite; overflow: hidden; position: relative; }
        .orb::before { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.35), rgba(180,140,255,.6) 40%, rgba(100,80,200,.8)); }
        .cta-title { font-size: clamp(28px,4vw,42px); font-weight: 800; letter-spacing: -.03em; color: #f0f0f5; margin-bottom: 16px; }
        .cta-sub { font-size: 16px; color: #8a8a9a; margin-bottom: 36px; line-height: 1.7; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        /* Footer */
        .footer { position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.06); padding: 36px 32px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-links { display: flex; gap: 6px; margin-left: auto; }
        .footer-links a { font-size: 13px; color: #44445a; text-decoration: none; padding: 5px 10px; border-radius: 6px; transition: all .14s; }
        .footer-links a:hover { color: #8a8a9a; background: rgba(255,255,255,0.04); }
        .footer-copy { font-size: 12px; color: #44445a; width: 100%; padding-top: 12px; }

        /* Auth modal */
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); z-index: 200; }
        .auth-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 201; background: #16161e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px 36px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.6); }
        .modal-close { position: absolute; top: 14px; right: 14px; background: none; border: none; color: #44445a; font-size: 16px; cursor: pointer; padding: 6px; border-radius: 6px; transition: all .14s; }
        .modal-close:hover { background: rgba(255,255,255,0.06); color: #8a8a9a; }
        .auth-orb { width: 48px; height: 48px; border-radius: 50%; margin-bottom: 16px; }
        .auth-title { font-size: 22px; font-weight: 700; color: #f0f0f5; margin-bottom: 8px; }
        .auth-sub { font-size: 14px; color: #8a8a9a; margin-bottom: 28px; line-height: 1.6; }
        .auth-btn-primary { display: block; width: 100%; padding: 12px; border-radius: 10px; border: none; background: linear-gradient(135deg,#7c6af7,#4f8ef7); color: #fff; font-family: inherit; font-size: 14.5px; font-weight: 600; cursor: pointer; transition: all .2s; box-shadow: 0 0 20px rgba(124,106,247,.35); margin-bottom: 16px; }
        .auth-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .auth-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .auth-divider::before,.auth-divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .auth-divider span { font-size: 12px; color: #44445a; white-space: nowrap; }
        .auth-btn-secondary { display: block; width: 100%; padding: 11px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f0f0f5; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s; }
        .auth-btn-secondary:hover { background: rgba(255,255,255,0.08); }

        @media(max-width:768px){
          .features-grid { grid-template-columns: 1fr; }
          .problems-grid { grid-template-columns: 1fr; }
          .nav-links .nav-link { display: none; }
          .footer-links { margin-left: 0; }
        }
      `}</style>
        </div>
    )
}
