'use client'
import Image from 'next/image'

const TEAM = [
    {
        name: 'Vatsal Trivedi',
        role: 'Founder & Product',
        avatar: 'VT',
        color: '#7c6af7',
        bio: 'Saw the gap in how cybersecurity was being taught to students. Built CortexAI to fix it — combining AI, structured learning, and a product that actually feels good to use.',
    },
    {
        name: 'Rajeshwar',
        role: 'Backend Engineer',
        avatar: 'RJ',
        color: '#4f8ef7',
        bio: 'Built the infrastructure that powers CortexAI — from the AI routing system and database architecture to the API layer and session management.',
    },
    {
        name: 'Bhushan',
        role: 'Frontend Engineer',
        avatar: 'BH',
        color: '#10b981',
        bio: 'Crafted the interfaces students interact with every day. Focused on making CortexAI feel fast, intuitive, and premium — without the complexity.',
    },
    {
        name: 'Makran',
        role: 'Frontend & Research',
        avatar: 'MK',
        color: '#f59e0b',
        bio: 'Bridges the gap between research and product. Explores how students actually learn and translates that into UI decisions and content structure.',
    },
]

const TIMELINE = [
    { year: '2024', title: 'The frustration begins', desc: 'As students, we realized no tool existed that could explain any subject clearly, quickly, and in an exam-ready format.' },
    { year: 'Q1 2025', title: 'First prototype built', desc: 'A basic chatbot that could answer questions on any topic. Shared it with 20 classmates. The feedback was overwhelming — they wanted more.' },
    { year: 'Q2 2025', title: 'CortexAI v1 launched', desc: 'Full platform with authentication, chat history, multiple subjects, and smart AI routing. First 500 students signed up in the first week.' },
    { year: 'Today', title: 'Growing fast', desc: 'Used by 2,000+ students. Continuously improving based on real student feedback and learning patterns.' },
]

export default function AboutPage() {
    return (
        <div className="root">
            <div className="bg-blob bg-blob-1" />
            <div className="bg-blob bg-blob-2" />

            {/* Nav */}
            <nav className="nav">
                <div className="nav-inner">
                    <a href="/" className="nav-logo">
                        <Image src="/cortex-icon.png" alt="CortexAI" width={24} height={24} />
                        <span className="nav-logo-text">CortexAI</span>
                    </a>
                    <div className="nav-links">
                        <a href="/" className="nav-link">Home</a>
                        <a href="/blog" className="nav-link">Blog</a>
                        <a href="/chat" className="nav-cta">Open App →</a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="about-hero">
                <div className="section-label">About Us</div>
                <h1 className="about-title">We're students who got tired<br /><span className="grad">of learning the hard way</span></h1>
                <p className="about-sub">CortexAI is an AI learning assistant built by students who experienced the problem firsthand — and decided to fix it.</p>
            </section>

            {/* Problem we solve */}
            <section className="section">
                <div className="section-inner two-col">
                    <div className="col-text">
                        <div className="section-label">Why CortexAI Exists</div>
                        <h2 className="section-h2">Students were being left behind</h2>
                        <p className="body-text">Learning any subject today means navigating through dense textbooks, scattered tutorials, and endless Google searches. Textbooks are written for experts. Videos go on for hours. Explanations assume you already know the basics.</p>
                        <p className="body-text">We watched our classmates struggle with exams, spend hours trying to understand a single concept, and give up because there was no clear path to understanding.</p>
                        <p className="body-text">There was no tool that could sit with you, explain things at your level, and give you exactly what you needed for your exam in the next 12 hours.</p>
                        <p className="body-text" style={{ color: '#c4b5fd', fontWeight: 500 }}>So we built one.</p>
                    </div>
                    <div className="col-cards">
                        {[
                            { icon: '🎓', title: 'Built for students', desc: 'Every answer is structured for learning — definition first, then step-by-step, then exam summary.' },
                            { icon: '💡', title: 'Instant clarity', desc: 'No more spending 2 hours reading to find one clear explanation. CortexAI gets to the point.' },
                            { icon: '🎯', title: 'Exam focused', desc: 'Everything is designed around how students are tested — not how experts use the knowledge.' },
                        ].map((c, i) => (
                            <div key={i} className="mini-card">
                                <span className="mini-icon">{c.icon}</span>
                                <div>
                                    <div className="mini-title">{c.title}</div>
                                    <div className="mini-desc">{c.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision */}
            <section className="section vision-section">
                <div className="section-inner">
                    <div className="section-label">The Future</div>
                    <h2 className="section-h2">What CortexAI will become</h2>
                    <p className="body-text" style={{ maxWidth: 640, marginBottom: 48 }}>We're just getting started. CortexAI isn't just a Q&A bot — it's becoming the complete learning companion for every student.</p>
                    <div className="vision-grid">
                        {[
                            { icon: '🗺', title: 'Personalized Learning Paths', desc: 'CortexAI will understand where you are in your journey and guide you step by step — from beginner to expert.' },
                            { icon: '📋', title: 'Auto-Generated Study Notes', desc: 'Upload your syllabus. Get a complete, structured study guide tailored exactly to your course.' },
                            { icon: '🧪', title: 'Practice & Mock Tests', desc: 'Real exam-style questions with detailed explanations. Track your progress over time.' },
                            { icon: '🌐', title: 'Multi-Subject Support', desc: 'From Computer Science to Mathematics to Physics — learn any subject with structured explanations.' },
                            { icon: '👥', title: 'Study Groups & Collaboration', desc: 'Work through problems with classmates in shared sessions. Learn together.' },
                            { icon: '📱', title: 'Native Mobile App', desc: 'Study on the go. Full CortexAI experience on Android and iOS, built for students.' },
                        ].map((v, i) => (
                            <div key={i} className="vision-card">
                                <div className="vision-icon">{v.icon}</div>
                                <div className="vision-title">{v.title}</div>
                                <div className="vision-desc">{v.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section">
                <div className="section-inner">
                    <div className="section-label">Our Journey</div>
                    <h2 className="section-h2">How we got here</h2>
                    <div className="timeline">
                        {TIMELINE.map((t, i) => (
                            <div key={i} className="timeline-item">
                                <div className="timeline-left">
                                    <div className="timeline-year">{t.year}</div>
                                    {i < TIMELINE.length - 1 && <div className="timeline-line" />}
                                </div>
                                <div className="timeline-card">
                                    <div className="timeline-title">{t.title}</div>
                                    <div className="timeline-desc">{t.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="section">
                <div className="section-inner">
                    <div className="section-label">The Team</div>
                    <h2 className="section-h2">Built by students, for students</h2>
                    <p className="body-text" style={{ maxWidth: 520, marginBottom: 48 }}>Four people who got tired of struggling with bad learning resources and decided to do something about it.</p>
                    <div className="team-grid">
                        {TEAM.map((m, i) => (
                            <div key={i} className="team-card">
                                <div className="team-avatar" style={{ background: `${m.color}20`, border: `2px solid ${m.color}40`, color: m.color }}>{m.avatar}</div>
                                <div className="team-name">{m.name}</div>
                                <div className="team-role" style={{ color: m.color }}>{m.role}</div>
                                <div className="team-bio">{m.bio}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section" style={{ textAlign: 'center', paddingBottom: 96 }}>
                <div className="section-label">Ready?</div>
                <h2 className="section-h2">Start learning smarter today</h2>
                <p className="body-text" style={{ maxWidth: 480, margin: '0 auto 36px' }}>Free for students. No credit card required. Just sign up and start asking questions.</p>
                <a href="/chat" className="btn-primary">Open CortexAI →</a>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-logo">
                        <Image src="/cortex-icon.png" alt="CortexAI" width={18} height={18} style={{ opacity: 0.9 }} />
                        <span style={{ fontWeight: 700, color: '#f0f0f5', fontSize: 15, opacity: 0.9 }}>CortexAI</span>
                    </div>
                    <div className="footer-links">
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/chat">App</a>
                    </div>
                    <div className="footer-copy">© 2025 CortexAI · Built by students, for students · India 🇮🇳</div>
                </div>
            </footer>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Outfit', sans-serif; background: #0c0c0f; color: #f0f0f5; overflow-x: hidden; }

        @keyframes blob-drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-15px)} }
        @keyframes fadein { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        .root { position: relative; min-height: 100vh; }
        .bg-blob { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; animation: blob-drift 20s ease-in-out infinite; }
        .bg-blob-1 { width: 500px; height: 500px; top: -100px; left: -100px; background: rgba(124,106,247,0.1); }
        .bg-blob-2 { width: 400px; height: 400px; bottom: 10%; right: -80px; background: rgba(79,142,247,0.08); animation-delay: -10s; }

        /* Nav */
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(12,12,15,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }

        .nav-logo-text { font-size: 17px; font-weight: 700; color: #f0f0f5; }
        .nav-links { display: flex; align-items: center; gap: 6px; }
        .nav-link { background: none; border: none; font-family: inherit; font-size: 14px; color: #8a8a9a; cursor: pointer; padding: 6px 14px; border-radius: 8px; transition: all .15s; text-decoration: none; }
        .nav-link:hover { color: #f0f0f5; background: rgba(255,255,255,0.05); }
        .nav-cta { background: linear-gradient(135deg,#7c6af7,#4f8ef7); border: none; font-family: inherit; font-size: 13.5px; font-weight: 600; color: #fff; padding: 8px 18px; border-radius: 20px; cursor: pointer; transition: all .2s; text-decoration: none; }
        .nav-cta:hover { opacity: .9; }

        /* Hero */
        .about-hero { position: relative; z-index: 1; padding: 140px 32px 80px; text-align: center; max-width: 900px; margin: 0 auto; animation: fadein .5s ease both; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #7c6af7; margin-bottom: 14px; }
        .about-title { font-size: clamp(30px,5vw,56px); font-weight: 900; letter-spacing: -.035em; line-height: 1.1; color: #f0f0f5; margin-bottom: 20px; }
        .grad { background: linear-gradient(135deg,#c4b5fd,#818cf8,#60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .about-sub { font-size: 17px; color: #8a8a9a; line-height: 1.7; max-width: 560px; margin: 0 auto; }

        /* Section */
        .section { position: relative; z-index: 1; padding: 80px 32px; }
        .section-inner { max-width: 1100px; margin: 0 auto; }
        .section-h2 { font-size: clamp(24px,3.5vw,38px); font-weight: 800; letter-spacing: -.025em; color: #f0f0f5; margin-bottom: 16px; }
        .body-text { font-size: 15px; color: #8a8a9a; line-height: 1.8; margin-bottom: 14px; }

        /* Two col */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: start; }
        .mini-card { display: flex; gap: 14px; align-items: flex-start; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); margin-bottom: 10px; transition: all .2s; }
        .mini-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,106,247,0.2); }
        .mini-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
        .mini-title { font-size: 14px; font-weight: 600; color: #f0f0f5; margin-bottom: 4px; }
        .mini-desc { font-size: 13px; color: #8a8a9a; line-height: 1.6; }

        /* Vision section */
        .vision-section { background: rgba(255,255,255,0.015); }
        .vision-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .vision-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 22px; transition: all .2s; }
        .vision-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(124,106,247,0.25); transform: translateY(-2px); }
        .vision-icon { font-size: 26px; margin-bottom: 10px; }
        .vision-title { font-size: 14.5px; font-weight: 600; color: #f0f0f5; margin-bottom: 7px; }
        .vision-desc { font-size: 13px; color: #8a8a9a; line-height: 1.65; }

        /* Timeline */
        .timeline { display: flex; flex-direction: column; gap: 0; max-width: 680px; }
        .timeline-item { display: flex; gap: 24px; }
        .timeline-left { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; width: 90px; }
        .timeline-year { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: #7c6af7; background: rgba(124,106,247,0.1); border: 1px solid rgba(124,106,247,0.2); border-radius: 6px; padding: 4px 8px; white-space: nowrap; }
        .timeline-line { width: 1px; flex: 1; background: rgba(255,255,255,0.07); margin: 8px 0; min-height: 32px; }
        .timeline-card { flex: 1; padding: 0 0 36px; }
        .timeline-title { font-size: 16px; font-weight: 600; color: #f0f0f5; margin-bottom: 7px; }
        .timeline-desc { font-size: 14px; color: #8a8a9a; line-height: 1.7; }

        /* Team */
        .team-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .team-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px 20px; text-align: center; transition: all .2s; }
        .team-card:hover { background: rgba(255,255,255,0.05); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.25); }
        .team-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; margin: 0 auto 14px; }
        .team-name { font-size: 16px; font-weight: 700; color: #f0f0f5; margin-bottom: 4px; }
        .team-role { font-size: 12px; font-weight: 600; letter-spacing: .04em; margin-bottom: 12px; }
        .team-bio { font-size: 13px; color: #8a8a9a; line-height: 1.65; }

        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg,#7c6af7,#4f8ef7); color: #fff; font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; box-shadow: 0 0 24px rgba(124,106,247,.4); text-decoration: none; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 36px rgba(124,106,247,.6); }

        /* Footer */
        .footer { position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,0.06); padding: 32px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .footer-logo { display: flex; align-items: center; gap: 8px; }
        .footer-links { display: flex; gap: 4px; margin-left: auto; }
        .footer-links a { font-size: 13px; color: #44445a; text-decoration: none; padding: 5px 10px; border-radius: 6px; transition: all .14s; }
        .footer-links a:hover { color: #8a8a9a; }
        .footer-copy { font-size: 12px; color: #44445a; width: 100%; padding-top: 10px; }

        @media(max-width:900px){
          .two-col { grid-template-columns: 1fr; }
          .vision-grid { grid-template-columns: 1fr 1fr; }
          .team-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width:600px){
          .vision-grid { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    )
}
