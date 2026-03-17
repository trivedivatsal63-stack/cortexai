'use client'

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0d12', color: '#e2e8f0', fontFamily: 'inherit' }}>

            {/* Nav */}
            <div style={{ background: '#0f1318', borderBottom: '0.5px solid rgba(0,255,136,0.12)', padding: '0 20px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>⚡</span>
                    <span style={{ fontWeight: 700, color: '#00ff88', letterSpacing: '0.06em', fontSize: '15px' }}>CyberAI</span>
                    <span style={{ fontSize: '10px', background: 'rgba(0,255,136,0.08)', border: '0.5px solid rgba(0,255,136,0.2)', color: '#00ff88', padding: '2px 7px', borderRadius: '3px', fontFamily: 'monospace' }}>v2.0</span>
                    <span style={{ fontSize: '10px', background: 'rgba(255,107,0,0.1)', border: '0.5px solid rgba(255,107,0,0.3)', color: '#ff6b00', padding: '2px 7px', borderRadius: '3px', fontFamily: 'monospace' }}>GROQ</span>
                </div>
                <a href="/" style={{ fontSize: '11px', fontWeight: 700, color: '#00ff88', fontFamily: 'monospace', textDecoration: 'none', padding: '4px 12px', border: '0.5px solid rgba(0,255,136,0.35)', borderRadius: '4px', background: 'rgba(0,255,136,0.06)', letterSpacing: '0.06em' }}>
                    ← BACK TO APP
                </a>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,255,136,0.06)', border: '0.5px solid rgba(0,255,136,0.2)', borderRadius: '20px', padding: '4px 14px', marginBottom: '20px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s ease-in-out infinite' }} />
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#00ff88', letterSpacing: '0.08em' }}>ACTIVE PROJECT</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 700, color: '#00ff88', marginBottom: '16px', letterSpacing: '0.02em' }}>
                        ⚡ CyberAI
                    </h1>
                    <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '580px', margin: '0 auto', lineHeight: 1.7 }}>
                        An intelligent AI-powered cybersecurity assistant for log analysis, ethical hacking guidance, deep knowledge exploration, and real-world security learning.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                        {['v2.0', 'Powered by Groq', 'LLaMA 3.3 70B', 'Next.js', 'Free & Open'].map((tag, i) => (
                            <span key={i} style={{ fontSize: '11px', fontFamily: 'monospace', padding: '3px 10px', borderRadius: '4px', background: i === 0 ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${i === 0 ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.08)'}`, color: i === 0 ? '#00ff88' : '#64748b' }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: '0.5px', background: 'rgba(0,255,136,0.1)', marginBottom: '48px' }} />

                {/* What is CyberAI */}
                <Section label="OVERVIEW" title="What is CyberAI?">
                    <p style={P}>
                        CyberAI is an advanced AI-powered platform designed for cybersecurity enthusiasts, students, and professionals. It helps analyze system logs, understand vulnerabilities, explore ethical hacking tools, and learn complex security concepts through an interactive and intelligent interface — all powered by state-of-the-art large language models running on Groq&apos;s ultra-fast inference hardware.
                    </p>
                    <p style={{ ...P, marginTop: '12px' }}>
                        Unlike generic chatbots, CyberAI is purpose-built for security — every mode, prompt, and knowledge domain is carefully engineered to give you deep, accurate, actionable responses on cybersecurity topics.
                    </p>
                </Section>

                {/* Core Features */}
                <Section label="CAPABILITIES" title="Core Features">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {[
                            { icon: '🔍', title: 'Log Analysis', desc: 'Analyze Linux/system logs, detect suspicious patterns with severity ratings, and get precise remediation steps.', color: '#3b82f6' },
                            { icon: '🐧', title: 'Kali Linux Tools', desc: 'Learn any Kali tool with exact commands, flag explanations, output interpretation, and workflow guidance.', color: '#a855f7' },
                            { icon: '🐞', title: 'Bug Bounty', desc: 'Full workflow from recon to responsible disclosure — CVSS scoring, PoC development, and professional reporting.', color: '#f59e0b' },
                            { icon: '💻', title: 'Script Assistance', desc: 'Generate and understand Python/Bash scripts with line-by-line comments and security-focused error handling.', color: '#10b981' },
                        ].map((f, i) => (
                            <div key={i} style={{ background: '#0f1318', border: `0.5px solid ${f.color}30`, borderRadius: '10px', padding: '16px' }}>
                                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{f.icon}</div>
                                <div style={{ fontWeight: 700, color: f.color, fontSize: '13px', marginBottom: '6px' }}>{f.title}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Knowledge Base */}
                <Section label="KNOWLEDGE BASE" title="8 Deep-Dive Domains">
                    <p style={{ ...P, marginBottom: '16px' }}>
                        The Knowledge Base provides textbook-depth answers across 8 cybersecurity domains — each powered by a specialized system prompt tuned for that domain using the 70B LLaMA model.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {[
                            { name: 'Operating Systems', desc: 'Kernel, memory, privilege rings, rootkits' },
                            { name: 'Networking', desc: 'OSI, TCP/IP, TLS, DNS/ARP attacks' },
                            { name: 'Malware Analysis', desc: 'Static/dynamic analysis, IOCs, YARA' },
                            { name: 'Cryptography', desc: 'AES, RSA, PKI, padding oracle' },
                            { name: 'Web Security', desc: 'OWASP Top 10, SQLi, XSS, SSRF' },
                            { name: 'Digital Forensics', desc: 'IR lifecycle, Volatility, artifacts' },
                            { name: 'Reverse Engineering', desc: 'x86 assembly, Ghidra, shellcode' },
                            { name: 'CTF & Practice', desc: 'ROP chains, pwn, HackTheBox' },
                        ].map((d, i) => (
                            <div key={i} style={{ background: '#0f1318', border: '0.5px solid rgba(0,255,136,0.1)', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ fontWeight: 700, fontSize: '12px', color: '#00ff88', marginBottom: '4px' }}>{d.name}</div>
                                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{d.desc}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* AI in Cybersecurity */}
                <Section label="AI & CYBERSECURITY" title="The Role of AI in Modern Security">
                    <p style={P}>
                        Artificial Intelligence plays a critical role in modern cybersecurity by improving threat detection, incident response, and security automation. Traditional security systems often rely on predefined rules and manual analysis — slow and ineffective against rapidly evolving threats. AI enables security systems to analyze vast amounts of data in real time and identify malicious patterns that human analysts would struggle to detect at scale.
                    </p>
                    <p style={{ ...P, marginTop: '12px' }}>
                        AI-driven solutions help organizations detect cyber threats such as malware, ransomware, phishing attacks, and network intrusions more efficiently. Machine learning algorithms analyze behavioral patterns across systems and networks to identify anomalies that indicate potential attacks — allowing security teams to respond faster and prevent damage before threats escalate.
                    </p>
                    <p style={{ ...P, marginTop: '12px' }}>
                        One of the major advantages of AI in cybersecurity is <span style={{ color: '#00ff88', fontWeight: 600 }}>automation</span>. AI systems can prioritize critical incidents, detect suspicious activity, and automatically trigger response mechanisms to mitigate attacks — reducing analyst workload and enabling focus on complex investigations.
                    </p>

                    <div style={{ margin: '20px 0', background: '#0f1318', border: '0.5px solid rgba(0,255,136,0.12)', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#00ff88', letterSpacing: '0.08em', marginBottom: '12px' }}>AI-POWERED SECURITY TECHNOLOGIES</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['Firewalls', 'Endpoint Security (EDR)', 'SIEM Platforms', 'XDR Solutions', 'Fraud Detection', 'IDS/IPS', 'Threat Intelligence', 'SOAR Platforms'].map((t, i) => (
                                <span key={i} style={{ fontSize: '11px', fontFamily: 'monospace', padding: '3px 10px', borderRadius: '3px', background: 'rgba(0,255,136,0.06)', border: '0.5px solid rgba(0,255,136,0.15)', color: 'rgba(0,255,136,0.8)' }}>{t}</span>
                            ))}
                        </div>
                    </div>

                    <p style={P}>
                        Another critical capability is <span style={{ color: '#00ff88', fontWeight: 600 }}>predictive threat analysis</span>. By analyzing historical attack data and threat intelligence feeds, AI models can predict potential attack vectors and identify vulnerabilities before attackers exploit them — helping organizations strengthen defensive strategies and reduce security risks proactively.
                    </p>

                    <div style={{ margin: '20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        {[
                            { label: 'Real-time threat monitoring', icon: '📡' },
                            { label: 'Faster incident response', icon: '⚡' },
                            { label: 'Improved vuln detection', icon: '🔍' },
                            { label: 'Automated threat hunting', icon: '🤖' },
                            { label: 'Enhanced network security', icon: '🛡️' },
                            { label: 'Cloud security posture', icon: '☁️' },
                        ].map((b, i) => (
                            <div key={i} style={{ background: '#0f1318', border: '0.5px solid rgba(0,255,136,0.08)', borderRadius: '7px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px' }}>{b.icon}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* CyberAI Vision */}
                <Section label="PROJECT VISION" title="How CyberAI Connects to Real AI Security">
                    <p style={P}>
                        What you&apos;re interacting with is essentially an <span style={{ color: '#00ff88', fontWeight: 600 }}>AI-powered cybersecurity knowledge and analysis assistant</span> — a step toward what modern security operations centers (SOCs) and penetration testers will use daily.
                    </p>
                    <div style={{ margin: '20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {[
                            { title: 'SOC Analyst Assistant', desc: 'Triage alerts, analyze logs, and suggest incident response steps automatically.', icon: '🖥️', color: '#3b82f6' },
                            { title: 'Pentesting Copilot', desc: 'Guide through recon, exploitation, and reporting for authorized security assessments.', icon: '🎯', color: '#a855f7' },
                            { title: 'Network Troubleshooting', desc: 'Diagnose network anomalies, packet captures, and configuration issues intelligently.', icon: '🌐', color: '#10b981' },
                            { title: 'Security Training Platform', desc: 'Teach cybersecurity concepts interactively with real examples and hands-on guidance.', icon: '📚', color: '#f59e0b' },
                        ].map((v, i) => (
                            <div key={i} style={{ background: '#0f1318', border: `0.5px solid ${v.color}25`, borderRadius: '10px', padding: '16px' }}>
                                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{v.icon}</div>
                                <div style={{ fontWeight: 700, color: v.color, fontSize: '12px', marginBottom: '6px' }}>{v.title}</div>
                                <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.6 }}>{v.desc}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ background: '#0f1318', border: '0.5px solid rgba(0,255,136,0.15)', borderRadius: '8px', padding: '16px', marginTop: '8px' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#00ff88', letterSpacing: '0.08em', marginBottom: '10px' }}>FUTURE ROADMAP</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[
                                'RAG + FAISS Vector Database for private security docs',
                                'Real-time CVE feed integration',
                                'Autonomous log scanning and alerting',
                                'Multi-agent security analysis pipeline',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                    <span style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>→</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Tech Stack */}
                <Section label="TECHNICAL" title="Tech Stack">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                        {[
                            { layer: 'Frontend', tech: 'Next.js 16 + Tailwind CSS', icon: '⚡' },
                            { layer: 'Backend', tech: 'Next.js API Routes', icon: '⚙️' },
                            { layer: 'AI Model', tech: 'LLaMA 3.3 70B via Groq', icon: '🧠' },
                            { layer: 'Fast Model', tech: 'LLaMA 3.1 8B Instant', icon: '🚀' },
                            { layer: 'Deployment', tech: 'Vercel (free tier)', icon: '☁️' },
                            { layer: 'Future', tech: 'RAG + FAISS Vector DB', icon: '🔍' },
                        ].map((s, i) => (
                            <div key={i} style={{ background: '#0f1318', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '14px' }}>{s.icon}</span>
                                    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.layer}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{s.tech}</div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Developer */}
                <Section label="DEVELOPER" title="Built By">
                    <div style={{ background: '#0f1318', border: '0.5px solid rgba(0,255,136,0.12)', borderRadius: '10px', padding: '20px', display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,255,136,0.1)', border: '0.5px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                            👨‍💻
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ fontWeight: 700, color: '#00ff88', fontSize: '15px', marginBottom: '4px' }}>Vatsal Trivedi</div>
                            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', marginBottom: '10px' }}>BCA Final Year · Cybersecurity & AI</div>
                            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.7 }}>
                                Passionate about building real-world intelligent security systems. CyberAI is a product of learning by doing — combining modern AI, cybersecurity knowledge, and full-stack development into a usable tool for the security community.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* CTA */}
                <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                    <div style={{ height: '0.5px', background: 'rgba(0,255,136,0.1)', marginBottom: '40px' }} />
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', fontFamily: 'monospace' }}>
                        Ready to explore cybersecurity with AI?
                    </p>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#00ff88', color: '#0a0d12', fontWeight: 700, fontSize: '13px', padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                        ⚡ Launch CyberAI
                    </a>
                </div>

            </div>

            <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 2px; }
        .about-btn:hover { background: rgba(0,255,136,0.12) !important; }
      `}</style>
        </div>
    )
}

const P: React.CSSProperties = {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.8,
}

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#00ff88', letterSpacing: '0.12em', background: 'rgba(0,255,136,0.06)', border: '0.5px solid rgba(0,255,136,0.2)', padding: '2px 8px', borderRadius: '3px' }}>
                    {label}
                </span>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,255,136,0.08)' }} />
            </div>
            <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>
                {title}
            </h2>
            {children}
        </div>
    )
}