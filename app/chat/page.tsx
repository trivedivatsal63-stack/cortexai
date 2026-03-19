'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Markdown from 'react-markdown'
import { UserButton } from '@clerk/nextjs'

type Message = { role: 'user' | 'assistant'; content: string }
type ToolMode = 'log' | 'kali' | 'bug' | 'script'
type KBMode = 'os' | 'net' | 'malware' | 'crypto' | 'web' | 'forensics' | 're' | 'ctf'
type ChatMode = 'general' | 'tools' | 'kb'
type ChatSession = {
    id: string
    title: string
    messages: Message[]
    mode: ChatMode
    subMode?: ToolMode | KBMode
    createdAt: number
}

const TOOL_MODES = [
    { id: 'log' as ToolMode, label: 'Log Analysis', color: '#3b82f6' },
    { id: 'kali' as ToolMode, label: 'Kali Tools', color: '#a855f7' },
    { id: 'bug' as ToolMode, label: 'Bug Bounty', color: '#f59e0b' },
    { id: 'script' as ToolMode, label: 'Script Help', color: '#10b981' },
]

const KB_DOMAINS = [
    { id: 'os' as KBMode, name: 'Operating Systems', desc: 'Kernel, memory, processes' },
    { id: 'net' as KBMode, name: 'Networking', desc: 'OSI, TCP/IP, DNS, TLS' },
    { id: 'malware' as KBMode, name: 'Malware Analysis', desc: 'Types, vectors, analysis' },
    { id: 'crypto' as KBMode, name: 'Cryptography', desc: 'AES, RSA, PKI, attacks' },
    { id: 'web' as KBMode, name: 'Web Security', desc: 'OWASP, SQLi, XSS, SSRF' },
    { id: 'forensics' as KBMode, name: 'Digital Forensics', desc: 'IR, memory, disk' },
    { id: 're' as KBMode, name: 'Reverse Engineering', desc: 'Assembly, Ghidra, shellcode' },
    { id: 'ctf' as KBMode, name: 'CTF & Practice', desc: 'Pwn, ROP, HackTheBox' },
]

function genId() { return Math.random().toString(36).slice(2) }
function getTitle(messages: Message[]) {
    const first = messages.find(m => m.role === 'user')
    if (!first) return 'New chat'
    return first.content.slice(0, 36) + (first.content.length > 36 ? '…' : '')
}

export default function CyberAI() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [chatMode, setChatMode] = useState<ChatMode>('general')
    const [toolMode, setToolMode] = useState<ToolMode>('log')
    const [kbMode, setKbMode] = useState<KBMode>('web')
    const chatEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const active = sessions.find(s => s.id === activeId) ?? null
    const messages = active?.messages ?? []

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

    useEffect(() => {
        fetch('/api/history')
            .then(r => r.json())
            .then(d => {
                if (d.messages && d.messages.length > 0) {
                    const restored: ChatSession = {
                        id: genId(),
                        title: getTitle(d.messages),
                        messages: d.messages,
                        mode: 'general',
                        createdAt: Date.now() - 1000,
                    }
                    setSessions([restored])
                    setActiveId(restored.id)
                }
            })
            .catch(() => { })
    }, [])

    function newChat() {
        const session: ChatSession = {
            id: genId(),
            title: 'New chat',
            messages: [],
            mode: chatMode,
            subMode: chatMode === 'tools' ? toolMode : chatMode === 'kb' ? kbMode : undefined,
            createdAt: Date.now(),
        }
        setSessions(prev => [session, ...prev])
        setActiveId(session.id)
        setError('')
        setInput('')
        setMobileOpen(false)
    }

    function switchSession(id: string) {
        setActiveId(id)
        setError('')
        setInput('')
        setMobileOpen(false)
    }

    function deleteSession(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        setSessions(prev => prev.filter(s => s.id !== id))
        if (activeId === id) setActiveId(sessions.filter(s => s.id !== id)[0]?.id ?? null)
    }

    async function sendMessage(text?: string) {
        const content = (text ?? input).trim()
        if (!content || loading) return

        let sessionId = activeId
        let currentSession = active

        if (!currentSession) {
            const session: ChatSession = {
                id: genId(),
                title: 'New chat',
                messages: [],
                mode: chatMode,
                subMode: chatMode === 'tools' ? toolMode : chatMode === 'kb' ? kbMode : undefined,
                createdAt: Date.now(),
            }
            setSessions(prev => [session, ...prev])
            setActiveId(session.id)
            sessionId = session.id
            currentSession = session
        }

        const newMessages: Message[] = [...currentSession.messages, { role: 'user', content }]
        setSessions(prev => prev.map(s => s.id === sessionId ? {
            ...s, messages: newMessages, title: getTitle(newMessages),
        } : s))

        setInput(''); setError(''); setLoading(true)
        if (textareaRef.current) { textareaRef.current.style.height = '24px' }

        const mode = currentSession.subMode ?? currentSession.mode

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages.slice(-8), mode }),
            })
            const data = await res.json()
            if (res.status === 429) { setError('Rate limit reached. Wait 60 seconds.'); return }
            if (!res.ok || data.error) { setError(data.error ?? 'Error'); return }

            const finalMessages = [...newMessages, { role: 'assistant' as const, content: data.reply }]
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: finalMessages } : s))

            await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userMessage: content, aiMessage: data.reply }),
            })
        } catch { setError('Network error.') }
        finally { setLoading(false) }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
    }

    function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setInput(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
    }

    const grouped = {
        today: sessions.filter(s => Date.now() - s.createdAt < 86400000),
        week: sessions.filter(s => Date.now() - s.createdAt >= 86400000 && Date.now() - s.createdAt < 604800000),
        older: sessions.filter(s => Date.now() - s.createdAt >= 604800000),
    }

    const modeColor = chatMode === 'tools'
        ? (TOOL_MODES.find(m => m.id === toolMode)?.color ?? '#00ff88')
        : '#00ff88'

    const activeTool = TOOL_MODES.find(m => m.id === toolMode)
    const activeKB = KB_DOMAINS.find(d => d.id === kbMode)

    return (
        <div className="layout">
            {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} ${mobileOpen ? 'mobile-show' : ''}`}>
                <div className="sidebar-top">
                    <div className="brand">
                        <span className="brand-icon">⚡</span>
                        <span className="brand-name">CyberAI</span>
                        <span className="brand-badge">v2.0</span>
                    </div>
                    <button className="new-chat-btn" onClick={newChat}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        New Chat
                    </button>
                </div>

                <div className="sidebar-history">
                    {sessions.length === 0 && <div className="no-history">No chats yet</div>}

                    {grouped.today.length > 0 && (
                        <div className="history-group">
                            <div className="history-label">Today</div>
                            {grouped.today.map(s => (
                                <div key={s.id} className={`history-item ${activeId === s.id ? 'history-active' : ''}`} onClick={() => switchSession(s.id)}>
                                    <div className="history-dot" />
                                    <span className="history-title">{s.title}</span>
                                    <button className="history-del" onClick={e => deleteSession(s.id, e)}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {grouped.week.length > 0 && (
                        <div className="history-group">
                            <div className="history-label">This week</div>
                            {grouped.week.map(s => (
                                <div key={s.id} className={`history-item ${activeId === s.id ? 'history-active' : ''}`} onClick={() => switchSession(s.id)}>
                                    <div className="history-dot" />
                                    <span className="history-title">{s.title}</span>
                                    <button className="history-del" onClick={e => deleteSession(s.id, e)}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {grouped.older.length > 0 && (
                        <div className="history-group">
                            <div className="history-label">Older</div>
                            {grouped.older.map(s => (
                                <div key={s.id} className={`history-item ${activeId === s.id ? 'history-active' : ''}`} onClick={() => switchSession(s.id)}>
                                    <div className="history-dot" />
                                    <span className="history-title">{s.title}</span>
                                    <button className="history-del" onClick={e => deleteSession(s.id, e)}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sidebar-bottom">
                    <div className="user-row">
                        <UserButton afterSignOutUrl="/sign-in" />
                        <span className="user-label">Account</span>
                    </div>
                    <a href="/about" className="about-link">ABOUT</a>
                </div>
            </aside>

            {/* Main */}
            <main className="main">
                {/* Topbar */}
                <div className="topbar">
                    <button className="toggle-btn" onClick={() => { setSidebarOpen(p => !p); setMobileOpen(p => !p) }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    </button>
                    <div className="mode-tabs">
                        {([['general', 'General'], ['tools', 'Tools'], ['kb', 'Knowledge Base']] as [ChatMode, string][]).map(([m, label]) => (
                            <button key={m} onClick={() => setChatMode(m)} className={`mode-tab ${chatMode === m ? 'mode-tab-active' : ''}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className="badge-groq">GROQ</span>
                    </div>
                </div>

                {/* Submode bar */}
                {chatMode === 'tools' && (
                    <div className="submode-bar">
                        {TOOL_MODES.map(m => (
                            <button key={m.id} onClick={() => setToolMode(m.id)} className="submode-btn"
                                style={{ borderColor: toolMode === m.id ? m.color : 'transparent', background: toolMode === m.id ? `${m.color}15` : 'transparent', color: toolMode === m.id ? m.color : '#475569' }}>
                                <span className="submode-dot" style={{ background: 'currentColor' }} />
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}
                {chatMode === 'kb' && (
                    <div className="submode-bar" style={{ flexWrap: 'wrap', gap: '5px' }}>
                        {KB_DOMAINS.map(d => (
                            <button key={d.id} onClick={() => setKbMode(d.id)} className="submode-btn"
                                style={{ borderColor: kbMode === d.id ? '#00ff88' : 'transparent', background: kbMode === d.id ? 'rgba(0,255,136,0.1)' : 'transparent', color: kbMode === d.id ? '#00ff88' : '#475569' }}>
                                {d.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Chat */}
                <div className="chat-area">
                    {messages.length === 0 && (
                        <div className="welcome">
                            <div className="welcome-icon">⚡</div>
                            <h1 className="welcome-title">CyberAI</h1>
                            <p className="welcome-sub">
                                {chatMode === 'general' && "Ask any cybersecurity question — I'll route it to the right expert system automatically."}
                                {chatMode === 'tools' && `${activeTool?.label} mode active. Ready to help.`}
                                {chatMode === 'kb' && `${activeKB?.name} knowledge base. ${activeKB?.desc}.`}
                            </p>
                            <div className="chips">
                                {chatMode === 'general' && ['How does ARP spoofing work?', 'Write a port scanner in Python', 'Explain SQL injection with examples', 'What is a buffer overflow exploit?'].map(q => (
                                    <button key={q} className="chip" onClick={() => sendMessage(q)}>{q}</button>
                                ))}
                                {chatMode === 'tools' && toolMode === 'log' && ['Analyze this auth log for anomalies', 'What does error code 403 mean?', 'Find brute force patterns in logs'].map(q => (
                                    <button key={q} className="chip" onClick={() => sendMessage(q)}>{q}</button>
                                ))}
                                {chatMode === 'tools' && toolMode === 'kali' && ['How do I use nmap for recon?', 'Explain Metasploit modules', 'How to use sqlmap?'].map(q => (
                                    <button key={q} className="chip" onClick={() => sendMessage(q)}>{q}</button>
                                ))}
                                {chatMode === 'tools' && toolMode === 'bug' && ['How to do subdomain enumeration?', 'Explain IDOR vulnerabilities', 'Write a vulnerability report template'].map(q => (
                                    <button key={q} className="chip" onClick={() => sendMessage(q)}>{q}</button>
                                ))}
                                {chatMode === 'tools' && toolMode === 'script' && ['Write a port scanner in Python', 'Create a log parser script', 'Write a Bash recon automation script'].map(q => (
                                    <button key={q} className="chip" onClick={() => sendMessage(q)}>{q}</button>
                                ))}
                                {chatMode === 'kb' && KB_DOMAINS.find(d => d.id === kbMode) && (
                                    <p className="kb-hint">{activeKB?.desc} — type your question below</p>
                                )}
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`msg-row ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                            <div className={`avatar ${msg.role === 'user' ? 'av-user' : 'av-ai'}`}>
                                {msg.role === 'user' ? 'U' : '⚡'}
                            </div>
                            <div className={`bubble ${msg.role === 'user' ? 'bub-user' : 'bub-ai'}`}>
                                {msg.role === 'assistant'
                                    ? <Markdown>{msg.content}</Markdown>
                                    : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="msg-row msg-ai">
                            <div className="avatar av-ai">⚡</div>
                            <div className="typing">
                                {[0, 1, 2].map(i => <span key={i} className="dot" style={{ animationDelay: `${i * 0.15}s` }} />)}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="input-area">
                    {error && <div className="error-msg">⚠ {error}</div>}
                    <div className="input-box">
                        <textarea ref={textareaRef} className="input-ta" value={input} onChange={handleInput} onKeyDown={handleKeyDown} rows={1}
                            placeholder={
                                chatMode === 'general' ? 'Ask anything cybersecurity...'
                                    : chatMode === 'tools' ? `Ask about ${activeTool?.label}...`
                                        : `Ask about ${activeKB?.name}...`
                            }
                        />
                        <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                            style={{ opacity: loading || !input.trim() ? 0.35 : 1 }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <div className="input-meta">
                        <span className="mode-pill" style={{ background: `${modeColor}15`, color: modeColor, borderColor: `${modeColor}25` }}>
                            {chatMode === 'general' ? 'AUTO-ROUTE' : chatMode === 'tools' ? activeTool?.label.toUpperCase() : activeKB?.name.toUpperCase()}
                        </span>
                        <span className="hint-text">Enter to send · Shift+Enter for newline</span>
                    </div>
                </div>
            </main>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; overflow: hidden; font-family: 'JetBrains Mono', monospace; }

        @keyframes blink { 0%,80%,100%{opacity:0.15;transform:scale(0.7)} 40%{opacity:1;transform:scale(1)} }
        @keyframes fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.12); border-radius: 2px; }
        pre { background: #0d1117 !important; border-radius: 8px; padding: 14px; overflow-x: auto; margin: 8px 0; border: 0.5px solid rgba(0,255,136,0.1); }
        code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #7dd3fc; }
        p { margin-bottom: 8px; line-height: 1.75; }
        ul, ol { padding-left: 20px; margin-bottom: 8px; }
        li { margin-bottom: 4px; line-height: 1.65; }
        h1,h2,h3 { color: #00ff88; margin: 14px 0 6px; font-family: 'Syne', sans-serif; }
        strong { color: #00ff88; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12px; }
        th,td { border: 0.5px solid rgba(0,255,136,0.12); padding: 7px 12px; }
        th { color: #00ff88; background: rgba(0,255,136,0.04); }

        .layout { display: flex; width: 100vw; height: 100vh; height: 100dvh; background: #080b10; overflow: hidden; }

        .sidebar { width: 256px; min-width: 256px; height: 100%; background: #0b0f18; border-right: 0.5px solid rgba(0,255,136,0.07); display: flex; flex-direction: column; transition: width 0.22s ease, min-width 0.22s ease; overflow: hidden; flex-shrink: 0; }
        .sidebar-closed { width: 0 !important; min-width: 0 !important; }
        .sidebar-top { padding: 16px 12px 12px; flex-shrink: 0; border-bottom: 0.5px solid rgba(0,255,136,0.06); }
        .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding-left: 2px; }
        .brand-icon { font-size: 16px; }
        .brand-name { font-family: 'Syne', sans-serif; font-weight: 800; color: #00ff88; font-size: 17px; letter-spacing: 0.02em; white-space: nowrap; }
        .brand-badge { font-size: 9px; background: rgba(0,255,136,0.07); border: 0.5px solid rgba(0,255,136,0.18); color: rgba(0,255,136,0.7); padding: 1px 6px; border-radius: 3px; white-space: nowrap; }
        .new-chat-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 14px; background: rgba(0,255,136,0.06); border: 0.5px solid rgba(0,255,136,0.18); border-radius: 8px; color: #00ff88; font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.15s; white-space: nowrap; letter-spacing: 0.05em; }
        .new-chat-btn:hover { background: rgba(0,255,136,0.11); border-color: rgba(0,255,136,0.32); }

        .sidebar-history { flex: 1; overflow-y: auto; padding: 8px 8px 0; }
        .no-history { font-size: 11px; color: #1e293b; text-align: center; padding: 24px 0; letter-spacing: 0.04em; }
        .history-group { margin-bottom: 18px; }
        .history-label { font-size: 9px; color: #1e293b; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 6px 7px; }
        .history-item { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 7px; cursor: pointer; border: 0.5px solid transparent; transition: all 0.12s; }
        .history-item:hover { background: rgba(255,255,255,0.025); border-color: rgba(0,255,136,0.07); }
        .history-active { background: rgba(0,255,136,0.06) !important; border-color: rgba(0,255,136,0.14) !important; }
        .history-dot { width: 4px; height: 4px; border-radius: 50%; background: #1e293b; flex-shrink: 0; transition: background 0.12s; }
        .history-active .history-dot { background: #00ff88; }
        .history-title { flex: 1; font-size: 11px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
        .history-active .history-title { color: #94a3b8; }
        .history-del { opacity: 0; background: none; border: none; color: #334155; cursor: pointer; padding: 3px; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.12s; flex-shrink: 0; }
        .history-item:hover .history-del { opacity: 1; }
        .history-del:hover { color: #f87171; background: rgba(248,113,113,0.1); }

        .sidebar-bottom { padding: 12px; border-top: 0.5px solid rgba(0,255,136,0.06); flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
        .user-row { display: flex; align-items: center; gap: 9px; }
        .user-label { font-size: 11px; color: #334155; white-space: nowrap; }
        .about-link { font-size: 9px; color: #1e293b; text-decoration: none; letter-spacing: 0.08em; transition: color 0.15s; }
        .about-link:hover { color: #00ff88; }

        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; background: #080b10; }

        .topbar { display: flex; align-items: center; gap: 10px; padding: 10px 20px; background: #0b0f18; border-bottom: 0.5px solid rgba(0,255,136,0.07); flex-shrink: 0; }
        .toggle-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: 0.5px solid rgba(255,255,255,0.06); border-radius: 7px; color: #334155; cursor: pointer; flex-shrink: 0; transition: all 0.15s; }
        .toggle-btn:hover { color: #00ff88; border-color: rgba(0,255,136,0.2); }
        .mode-tabs { display: flex; gap: 2px; background: rgba(0,0,0,0.4); border: 0.5px solid rgba(255,255,255,0.05); border-radius: 9px; padding: 3px; }
        .mode-tab { padding: 5px 16px; font-size: 11px; font-weight: 700; font-family: inherit; letter-spacing: 0.04em; color: #334155; background: none; border: none; border-radius: 7px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .mode-tab:hover { color: #64748b; }
        .mode-tab-active { background: rgba(0,255,136,0.09) !important; color: #00ff88 !important; }
        .badge-groq { font-size: 9px; background: rgba(255,107,0,0.08); border: 0.5px solid rgba(255,107,0,0.25); color: rgba(255,107,0,0.8); padding: 2px 8px; border-radius: 3px; letter-spacing: 0.05em; }

        .submode-bar { display: flex; gap: 5px; padding: 8px 20px; background: #0a0d15; border-bottom: 0.5px solid rgba(0,255,136,0.05); flex-shrink: 0; overflow-x: auto; }
        .submode-btn { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 6px; border: 0.5px solid; font-size: 11px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
        .submode-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        .chat-area { flex: 1; overflow-y: auto; padding: 20px 0 10px; display: flex; flex-direction: column; }

        .welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; padding: 48px 32px; text-align: center; animation: fadein 0.35s ease; }
        .welcome-icon { font-size: 44px; margin-bottom: 16px; }
        .welcome-title { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: #00ff88; letter-spacing: -0.02em; margin-bottom: 10px; }
        .welcome-sub { font-size: 13px; color: #334155; margin-bottom: 28px; max-width: 480px; line-height: 1.7; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 580px; }
        .chip { padding: 8px 18px; background: rgba(0,255,136,0.03); border: 0.5px solid rgba(0,255,136,0.12); border-radius: 20px; color: #475569; font-size: 12px; font-family: inherit; cursor: pointer; transition: all 0.15s; line-height: 1.4; text-align: left; }
        .chip:hover { background: rgba(0,255,136,0.08); border-color: rgba(0,255,136,0.28); color: #00ff88; }
        .kb-hint { font-size: 12px; color: #1e293b; }

        .msg-row { display: flex; gap: 14px; padding: 12px 28px; animation: fadein 0.2s ease; transition: background 0.1s; }
        .msg-row:hover { background: rgba(255,255,255,0.008); }
        .msg-user { flex-direction: row-reverse; }
        .avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 3px; }
        .av-user { background: rgba(59,130,246,0.12); border: 0.5px solid rgba(59,130,246,0.22); color: #60a5fa; }
        .av-ai { background: rgba(0,255,136,0.07); border: 0.5px solid rgba(0,255,136,0.18); color: #00ff88; font-size: 14px; }
        .bubble { max-width: min(700px, 78%); font-size: 13px; line-height: 1.75; color: #94a3b8; padding: 11px 16px; border-radius: 12px; }
        .bub-user { background: rgba(30,41,59,0.8); border: 0.5px solid rgba(59,130,246,0.12); color: #cbd5e1; border-radius: 12px 2px 12px 12px; }
        .bub-ai { background: rgba(15,20,30,0.9); border: 0.5px solid rgba(0,255,136,0.07); border-radius: 2px 12px 12px 12px; }

        .typing { display: flex; align-items: center; gap: 5px; padding: 14px 16px; background: rgba(15,20,30,0.9); border: 0.5px solid rgba(0,255,136,0.07); border-radius: 2px 12px 12px 12px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: #00ff88; display: inline-block; animation: blink 1.2s ease-in-out infinite; }

        .input-area { padding: 12px 28px 18px; background: #0b0f18; border-top: 0.5px solid rgba(0,255,136,0.07); flex-shrink: 0; }
        .error-msg { font-size: 11px; color: #f87171; background: rgba(248,113,113,0.06); border: 0.5px solid rgba(248,113,113,0.18); border-radius: 7px; padding: 7px 12px; margin-bottom: 10px; }
        .input-box { display: flex; gap: 10px; align-items: flex-end; background: #080b10; border: 0.5px solid rgba(0,255,136,0.12); border-radius: 12px; padding: 10px 12px; transition: border-color 0.15s; }
        .input-box:focus-within { border-color: rgba(0,255,136,0.28); }
        .input-ta { flex: 1; background: none; border: none; outline: none; color: #cbd5e1; font-size: 13px; font-family: inherit; resize: none; min-height: 24px; max-height: 160px; line-height: 1.65; }
        .input-ta::placeholder { color: #1e293b; }
        .send-btn { width: 34px; height: 34px; min-width: 34px; border-radius: 8px; border: none; background: #00ff88; color: #080b10; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .send-btn:hover:not(:disabled) { background: #00e87a; transform: scale(1.05); }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .send-btn:disabled { cursor: not-allowed; }
        .input-meta { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
        .mode-pill { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 3px; border: 0.5px solid; letter-spacing: 0.07em; white-space: nowrap; }
        .hint-text { font-size: 10px; color: #1e293b; }

        .mobile-overlay { display: none; }
        @media (max-width: 768px) {
          .sidebar { position: fixed; left: 0; top: 0; z-index: 100; transform: translateX(-100%); transition: transform 0.22s ease; width: 256px !important; min-width: 256px !important; }
          .sidebar-closed { width: 256px !important; min-width: 256px !important; }
          .mobile-show { transform: translateX(0) !important; }
          .mobile-overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 99; }
          .msg-row { padding: 10px 16px; }
          .input-area { padding: 10px 16px 14px; }
          .mode-tab { padding: 5px 10px; font-size: 10px; }
          .welcome-title { font-size: 26px; }
          .bubble { max-width: 90%; }
        }
      `}</style>
        </div>
    )
}
