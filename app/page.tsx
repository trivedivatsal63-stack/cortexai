'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

type Message = { role: 'user' | 'assistant'; content: string }
type ToolMode = 'log' | 'kali' | 'bug' | 'script'
type KBMode = 'os' | 'net' | 'malware' | 'crypto' | 'web' | 'forensics' | 're' | 'ctf'
type Tab = 'tools' | 'kb'

const TOOL_MODES = [
  { id: 'log' as ToolMode, label: 'Log Analysis', color: '#3b82f6', placeholder: 'Paste logs or describe a system issue...' },
  { id: 'kali' as ToolMode, label: 'Kali Tools', color: '#a855f7', placeholder: 'Ask about any Kali Linux tool...' },
  { id: 'bug' as ToolMode, label: 'Bug Bounty', color: '#f59e0b', placeholder: 'Ask about recon, scanning, or reporting...' },
  { id: 'script' as ToolMode, label: 'Script Help', color: '#10b981', placeholder: 'Ask for Python/Bash scripts or code help...' },
]

const KB_DOMAINS = [
  {
    id: 'os' as KBMode, name: 'Operating Systems', desc: 'Kernel, memory, processes, privilege rings',
    topics: [{ label: 'processes', q: 'How does the Linux kernel manage processes?' }, { label: 'virtual memory', q: 'Explain virtual memory and paging in detail' }, { label: 'privilege rings', q: 'What are CPU privilege rings and how do they relate to security?' }, { label: 'rootkits', q: 'How do rootkits persist on a system?' }]
  },
  {
    id: 'net' as KBMode, name: 'Networking', desc: 'OSI model, TCP/IP, DNS, ARP, TLS, attacks',
    topics: [{ label: 'OSI model', q: 'Explain the OSI model with security relevance at each layer' }, { label: 'TLS handshake', q: 'How does a TLS handshake work step by step?' }, { label: 'DNS attacks', q: 'What is DNS poisoning and how does it work?' }, { label: 'ARP spoofing', q: 'Explain ARP spoofing and MITM attacks' }]
  },
  {
    id: 'malware' as KBMode, name: 'Malware Analysis', desc: 'Types, infection vectors, static/dynamic analysis',
    topics: [{ label: 'malware types', q: 'What are all the types of malware and how does each work?' }, { label: 'static analysis', q: 'How do I do static malware analysis step by step?' }, { label: 'persistence', q: 'What persistence mechanisms do malware authors use?' }, { label: 'IOCs', q: 'What are indicators of compromise (IOCs)?' }]
  },
  {
    id: 'crypto' as KBMode, name: 'Cryptography', desc: 'AES, RSA, hashing, PKI, TLS, crypto attacks',
    topics: [{ label: 'AES', q: 'How does AES encryption work internally?' }, { label: 'RSA', q: 'Explain RSA encryption and its security assumptions' }, { label: 'padding oracle', q: 'What is a padding oracle attack?' }, { label: 'PKI & certs', q: 'How does PKI and certificate chain validation work?' }]
  },
  {
    id: 'web' as KBMode, name: 'Web Security', desc: 'OWASP Top 10, SQLi, XSS, CSRF, SSRF',
    topics: [{ label: 'SQL injection', q: 'Explain SQL injection with examples and prevention' }, { label: 'XSS types', q: 'Explain all three types of XSS attacks with examples' }, { label: 'SSRF', q: 'What is SSRF and how is it exploited?' }, { label: 'OWASP Top 10', q: 'Walk me through the full OWASP Top 10 with examples' }]
  },
  {
    id: 'forensics' as KBMode, name: 'Digital Forensics', desc: 'IR lifecycle, memory & disk forensics, tools',
    topics: [{ label: 'IR lifecycle', q: 'Explain the incident response lifecycle (PICERL)' }, { label: 'Volatility', q: 'How to do memory forensics with Volatility3?' }, { label: 'Windows artifacts', q: 'What artifacts do forensics investigators look at on Windows?' }, { label: 'chain of custody', q: 'How does chain of custody work in digital forensics?' }]
  },
  {
    id: 're' as KBMode, name: 'Reverse Engineering', desc: 'Assembly, Ghidra, x64dbg, shellcode',
    topics: [{ label: 'x86 assembly', q: 'Explain x86 assembly basics for reverse engineering' }, { label: 'Ghidra', q: 'How to use Ghidra for binary analysis?' }, { label: 'anti-debug', q: 'What is anti-debugging and how do malware authors use it?' }, { label: 'shellcode', q: 'How to analyze shellcode step by step?' }]
  },
  {
    id: 'ctf' as KBMode, name: 'CTF & Practice', desc: 'Binary exploitation, pwn, ROP, HackTheBox',
    topics: [{ label: 'buffer overflow', q: 'Explain buffer overflow exploitation step by step' }, { label: 'ROP chains', q: 'What is ROP chain exploitation?' }, { label: 'getting started', q: 'How to get started with HackTheBox and TryHackMe?' }, { label: 'writeups', q: 'How to write a good CTF writeup?' }]
  },
]

export default function Home() {
  const [tab, setTab] = useState<Tab>('tools')
  const [toolMode, setToolMode] = useState<ToolMode>('log')
  const [kbMode, setKbMode] = useState<KBMode | null>(null)
  const [toolMessages, setToolMessages] = useState<Message[]>([])
  const [kbMessages, setKbMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const messages = tab === 'tools' ? toolMessages : kbMessages
  const setMessages = tab === 'tools' ? setToolMessages : setKbMessages
  const currentMode = tab === 'tools' ? toolMode : (kbMode ?? 'os')
  const activeTool = TOOL_MODES.find(m => m.id === toolMode)!
  const activeKB = kbMode ? KB_DOMAINS.find(d => d.id === kbMode) : null

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    if (tab === 'kb' && !kbMode) return
    setInput(''); setError(''); setLoading(true)
    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-6), mode: currentMode }),
      })
      const data = await res.json()
      if (res.status === 429) { setError('Rate limit — wait 60 seconds.'); return }
      if (!res.ok || data.error) { setError(data.error ?? 'Error. Check GROQ_API_KEY.'); return }
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch { setError('Network error — is the server running?') }
    finally { setLoading(false) }
  }

  async function sendKBMessage(mode: KBMode, content: string) {
    setLoading(true); setError('')
    const newMsgs: Message[] = [{ role: 'user', content }]
    setKbMessages(newMsgs)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, mode }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setError(data.error ?? 'Error'); return }
      setKbMessages([...newMsgs, { role: 'assistant', content: data.reply }])
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  function openKB(domain: KBMode, question?: string) {
    setKbMode(domain); setKbMessages([]); setError('')
    if (question) setTimeout(() => sendKBMessage(domain, question), 50)
  }

  const S = {
    wrap: { minHeight: '100vh', background: '#0a0d12', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } as React.CSSProperties,
    card: { width: '100%', maxWidth: '860px', border: '0.5px solid rgba(0,255,136,0.15)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' as const, height: 'calc(100vh - 32px)', maxHeight: '800px' },
    hdr: { background: '#0f1318', borderBottom: '0.5px solid rgba(0,255,136,0.12)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 } as React.CSSProperties,
    tabs: { display: 'flex', background: '#0f1318', borderBottom: '0.5px solid rgba(0,255,136,0.12)', flexShrink: 0 } as React.CSSProperties,
    modebar: { display: 'flex', gap: '6px', padding: '10px 14px', background: '#0f1318', borderBottom: '0.5px solid rgba(0,255,136,0.1)', flexWrap: 'wrap' as const, flexShrink: 0 } as React.CSSProperties,
    chat: { flex: 1, overflowY: 'auto' as const, padding: '14px', display: 'flex', flexDirection: 'column' as const, gap: '12px', background: '#0a0d12' },
    inputArea: { padding: '10px 14px', background: '#0f1318', borderTop: '0.5px solid rgba(0,255,136,0.1)', flexShrink: 0 } as React.CSSProperties,
  }

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.hdr}>
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span style={{ fontWeight: 700, color: '#00ff88', letterSpacing: '0.06em', fontSize: '15px' }}>CyberAI</span>
          <span style={{ fontSize: '10px', background: 'rgba(0,255,136,0.08)', border: '0.5px solid rgba(0,255,136,0.2)', color: '#00ff88', padding: '2px 7px', borderRadius: '3px', fontFamily: 'monospace' }}>v2.0</span>
          <span style={{ fontSize: '10px', background: 'rgba(255,107,0,0.1)', border: '0.5px solid rgba(255,107,0,0.3)', color: '#ff6b00', padding: '2px 7px', borderRadius: '3px', fontFamily: 'monospace' }}>GROQ</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s ease-in-out infinite' }} />
            ONLINE
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {(['tools', 'kb'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              style={{ padding: '8px 18px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: tab === t ? '#00ff88' : '#64748b', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? '#00ff88' : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t === 'tools' ? 'TOOLS' : 'KNOWLEDGE BASE'}
            </button>
          ))}
        </div>

        {/* TOOLS PANEL */}
        {tab === 'tools' && (
          <>
            <div style={S.modebar}>
              {TOOL_MODES.map(m => (
                <button key={m.id} onClick={() => { setToolMode(m.id); setToolMessages([]); setError('') }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 11px', borderRadius: '5px', border: `0.5px solid ${toolMode === m.id ? m.color : 'transparent'}`, background: toolMode === m.id ? `${m.color}20` : 'transparent', color: toolMode === m.id ? m.color : '#64748b', cursor: 'pointer', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />{m.label}
                </button>
              ))}
            </div>
            <div style={S.chat}>
              {toolMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: activeTool.color, marginBottom: '6px' }}>{activeTool.label}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>Mode active — ask anything below</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left' }}>
                    {TOOL_MODES.map(m => (
                      <div key={m.id} onClick={() => { setToolMode(m.id as ToolMode); setToolMessages([]); setTimeout(() => sendMessage(m.placeholder.replace('...', '')), 50) }}
                        style={{ padding: '10px 12px', background: '#141920', border: '0.5px solid rgba(0,255,136,0.1)', borderRadius: '7px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: m.color, marginBottom: '3px', fontFamily: 'monospace', textTransform: 'uppercase' }}>{m.label}</div>
                        <div style={{ fontSize: '11px', color: '#e2e8f0' }}>{m.placeholder.replace('...', '')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Messages messages={toolMessages} loading={loading} />
              <div ref={chatEndRef} />
            </div>
            <InputBar value={input} onChange={setInput} onSend={() => sendMessage()} loading={loading} error={error}
              placeholder={activeTool.placeholder} modeLabel={activeTool.label} modeColor={activeTool.color} textareaRef={textareaRef}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
          </>
        )}

        {/* KB PANEL */}
        {tab === 'kb' && (
          <>
            {!kbMode ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: '#0a0d12' }}>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginBottom: '10px' }}>SELECT A DOMAIN TO EXPLORE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {KB_DOMAINS.map(d => (
                    <div key={d.id} onClick={() => openKB(d.id)}
                      style={{ background: '#141920', border: '0.5px solid rgba(0,255,136,0.12)', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#e2e8f0', marginBottom: '3px' }}>{d.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px' }}>{d.desc}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {d.topics.map(t => (
                          <span key={t.label} onClick={e => { e.stopPropagation(); openKB(d.id, t.q) }}
                            style={{ fontSize: '9px', fontFamily: 'monospace', padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,255,136,0.06)', border: '0.5px solid rgba(0,255,136,0.15)', color: 'rgba(0,255,136,0.8)', cursor: 'pointer' }}>
                            {t.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#0f1318', borderBottom: '0.5px solid rgba(0,255,136,0.1)', flexShrink: 0 }}>
                  <button onClick={() => { setKbMode(null); setKbMessages([]); setError('') }}
                    style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>← back</button>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88' }} />
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                    DOMAIN: <span style={{ color: '#00ff88' }}>{activeKB?.name.toUpperCase()}</span>
                  </span>
                </div>
                <div style={S.chat}>
                  {kbMessages.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#00ff88', marginBottom: '6px' }}>{activeKB?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>Click a topic or type your question</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                        {activeKB?.topics.map(t => (
                          <button key={t.label} onClick={() => sendKBMessage(kbMode!, t.q)}
                            style={{ fontSize: '10px', fontFamily: 'monospace', padding: '5px 12px', borderRadius: '4px', background: 'rgba(0,255,136,0.06)', border: '0.5px solid rgba(0,255,136,0.2)', color: '#00ff88', cursor: 'pointer' }}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Messages messages={kbMessages} loading={loading} />
                  <div ref={chatEndRef} />
                </div>
                <InputBar value={input} onChange={setInput} onSend={() => sendMessage()} loading={loading} error={error}
                  placeholder={`Ask anything about ${activeKB?.name}...`} modeLabel={activeKB?.name ?? ''} modeColor="#00ff88" textareaRef={textareaRef}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
        @keyframes blink{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(0,255,136,0.2);border-radius:2px}
        pre{background:#0d1117!important;border-radius:6px;padding:12px;overflow-x:auto}
        code{font-family:'JetBrains Mono','Courier New',monospace;font-size:12px}
        p{margin-bottom:6px} ul,ol{padding-left:18px;margin-bottom:6px} li{margin-bottom:3px}
        h1,h2,h3{color:#00ff88;margin:10px 0 5px} strong{color:#00ff88}
        table{border-collapse:collapse;width:100%;margin:8px 0}
        th,td{border:0.5px solid rgba(0,255,136,0.15);padding:6px 10px;font-size:12px}
        th{color:#00ff88}
      `}</style>
    </div>
  )
}

function Messages({ messages, loading }: { messages: Message[]; loading: boolean }) {
  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
          <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace', padding: '0 4px' }}>{msg.role === 'user' ? 'YOU' : 'CYBERAI'}</div>
          <div style={{ maxWidth: '88%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.role === 'user' ? 'rgba(0,255,136,0.08)' : '#141920', border: msg.role === 'user' ? '0.5px solid rgba(0,255,136,0.25)' : '0.5px solid rgba(0,255,136,0.12)', fontSize: '13px', lineHeight: '1.65', color: '#e2e8f0' }}>
            {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace', padding: '0 4px' }}>CYBERAI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 14px', background: '#141920', border: '0.5px solid rgba(0,255,136,0.12)', borderRadius: '10px 10px 10px 2px' }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}
    </>
  )
}

function InputBar({ value, onChange, onSend, onKeyDown, loading, error, placeholder, modeLabel, modeColor, textareaRef }: {
  value: string; onChange: (v: string) => void; onSend: () => void; onKeyDown: (e: React.KeyboardEvent) => void
  loading: boolean; error: string; placeholder: string; modeLabel: string; modeColor: string
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div style={{ padding: '10px 14px', background: '#0f1318', borderTop: '0.5px solid rgba(0,255,136,0.1)', flexShrink: 0 }}>
      {error && <div style={{ fontSize: '11px', color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: '5px', padding: '6px 10px', marginBottom: '8px', fontFamily: 'monospace' }}>⚠ {error}</div>}
      <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'monospace', marginBottom: '7px' }}>
        MODE: <span style={{ background: `${modeColor}20`, color: modeColor, padding: '1px 7px', borderRadius: '3px', fontWeight: 700 }}>{modeLabel.toUpperCase()}</span>
        <span style={{ marginLeft: '8px', color: '#334155' }}>· Enter to send · Shift+Enter for newline</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <textarea ref={textareaRef} value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1}
          style={{ flex: 1, background: '#0a0d12', border: '0.5px solid rgba(0,255,136,0.15)', borderRadius: '7px', padding: '9px 12px', color: '#e2e8f0', fontSize: '13px', fontFamily: 'inherit', resize: 'none', minHeight: '38px', maxHeight: '120px', lineHeight: '1.5', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = 'rgba(0,255,136,0.35)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(0,255,136,0.15)')} />
        <button onClick={onSend} disabled={loading || !value.trim()}
          style={{ width: '36px', height: '36px', borderRadius: '7px', background: loading || !value.trim() ? 'rgba(0,255,136,0.3)' : '#00ff88', border: 'none', cursor: loading || !value.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0a0d12' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}