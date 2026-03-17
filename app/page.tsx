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
  { id: 'os' as KBMode, name: 'Operating Systems', desc: 'Kernel, memory, processes, privilege rings', topics: [{ label: 'processes', q: 'How does the Linux kernel manage processes?' }, { label: 'virtual memory', q: 'Explain virtual memory and paging in detail' }, { label: 'privilege rings', q: 'What are CPU privilege rings and how do they relate to security?' }, { label: 'rootkits', q: 'How do rootkits persist on a system?' }] },
  { id: 'net' as KBMode, name: 'Networking', desc: 'OSI model, TCP/IP, DNS, ARP, TLS, attacks', topics: [{ label: 'OSI model', q: 'Explain the OSI model with security relevance at each layer' }, { label: 'TLS handshake', q: 'How does a TLS handshake work step by step?' }, { label: 'DNS attacks', q: 'What is DNS poisoning and how does it work?' }, { label: 'ARP spoofing', q: 'Explain ARP spoofing and MITM attacks' }] },
  { id: 'malware' as KBMode, name: 'Malware Analysis', desc: 'Types, infection vectors, static/dynamic analysis', topics: [{ label: 'malware types', q: 'What are all the types of malware and how does each work?' }, { label: 'static analysis', q: 'How do I do static malware analysis step by step?' }, { label: 'persistence', q: 'What persistence mechanisms do malware authors use?' }, { label: 'IOCs', q: 'What are indicators of compromise (IOCs)?' }] },
  { id: 'crypto' as KBMode, name: 'Cryptography', desc: 'AES, RSA, hashing, PKI, TLS, crypto attacks', topics: [{ label: 'AES', q: 'How does AES encryption work internally?' }, { label: 'RSA', q: 'Explain RSA encryption and its security assumptions' }, { label: 'padding oracle', q: 'What is a padding oracle attack?' }, { label: 'PKI & certs', q: 'How does PKI and certificate chain validation work?' }] },
  { id: 'web' as KBMode, name: 'Web Security', desc: 'OWASP Top 10, SQLi, XSS, CSRF, SSRF', topics: [{ label: 'SQL injection', q: 'Explain SQL injection with examples and prevention' }, { label: 'XSS types', q: 'Explain all three types of XSS attacks with examples' }, { label: 'SSRF', q: 'What is SSRF and how is it exploited?' }, { label: 'OWASP Top 10', q: 'Walk me through the full OWASP Top 10 with examples' }] },
  { id: 'forensics' as KBMode, name: 'Digital Forensics', desc: 'IR lifecycle, memory and disk forensics, tools', topics: [{ label: 'IR lifecycle', q: 'Explain the incident response lifecycle (PICERL)' }, { label: 'Volatility', q: 'How to do memory forensics with Volatility3?' }, { label: 'Windows artifacts', q: 'What artifacts do forensics investigators look at on Windows?' }, { label: 'chain of custody', q: 'How does chain of custody work in digital forensics?' }] },
  { id: 're' as KBMode, name: 'Reverse Engineering', desc: 'Assembly, Ghidra, x64dbg, shellcode', topics: [{ label: 'x86 assembly', q: 'Explain x86 assembly basics for reverse engineering' }, { label: 'Ghidra', q: 'How to use Ghidra for binary analysis?' }, { label: 'anti-debug', q: 'What is anti-debugging and how do malware authors use it?' }, { label: 'shellcode', q: 'How to analyze shellcode step by step?' }] },
  { id: 'ctf' as KBMode, name: 'CTF and Practice', desc: 'Binary exploitation, pwn, ROP, HackTheBox', topics: [{ label: 'buffer overflow', q: 'Explain buffer overflow exploitation step by step' }, { label: 'ROP chains', q: 'What is ROP chain exploitation?' }, { label: 'getting started', q: 'How to get started with HackTheBox and TryHackMe?' }, { label: 'writeups', q: 'How to write a good CTF writeup?' }] },
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

  const messages = tab === 'tools' ? toolMessages : kbMessages
  const setMessages = tab === 'tools' ? setToolMessages : setKbMessages
  const currentMode = tab === 'tools' ? toolMode : (kbMode ?? 'os')
  const activeTool = TOOL_MODES.find(m => m.id === toolMode)!
  const activeKB = kbMode ? KB_DOMAINS.find(d => d.id === kbMode) : null

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

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
      if (res.status === 429) { setError('Rate limit reached. Wait 60 seconds.'); return }
      if (!res.ok || data.error) { setError(data.error ?? 'Error. Check GROQ_API_KEY.'); return }
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
    } catch { setError('Network error.') }
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

  return (
    <div className="app-wrap">
      <div className="app-card">

        <div className="app-hdr">
          <span style={{ fontSize: '18px' }}>⚡</span>
          <span className="app-logo">CyberAI</span>
          <span className="badge-green">v2.0</span>
          <span className="badge-orange">GROQ</span>
          <div className="online-indicator">
            <div className="online-dot" />
            <span className="online-label">ONLINE</span>
          </div>
        </div>

        <div className="app-tabs">
          {(['tools', 'kb'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }}
              className={`tab-btn ${tab === t ? 'tab-active' : ''}`}>
              {t === 'tools' ? 'TOOLS' : 'KNOWLEDGE BASE'}
            </button>
          ))}
        </div>

        {tab === 'tools' && (
          <>
            <div className="modebar">
              {TOOL_MODES.map(m => (
                <button key={m.id} onClick={() => { setToolMode(m.id); setToolMessages([]); setError('') }}
                  className="mode-btn"
                  style={{ border: `0.5px solid ${toolMode === m.id ? m.color : 'transparent'}`, background: toolMode === m.id ? `${m.color}20` : 'transparent', color: toolMode === m.id ? m.color : '#64748b' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                  {m.label}
                </button>
              ))}
            </div>
            <div className="chat-area">
              {toolMessages.length === 0 && (
                <div className="welcome">
                  <div className="welcome-title" style={{ color: activeTool.color }}>{activeTool.label}</div>
                  <div className="welcome-sub">Mode active — ask anything below</div>
                  <div className="suggestions-grid">
                    {TOOL_MODES.map(m => (
                      <div key={m.id} className="suggestion-card"
                        onClick={() => { setToolMode(m.id as ToolMode); setToolMessages([]); setTimeout(() => sendMessage(m.placeholder.replace('...', '')), 50) }}>
                        <div className="suggestion-label" style={{ color: m.color }}>{m.label}</div>
                        <div className="suggestion-text">{m.placeholder.replace('...', '')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Messages messages={toolMessages} loading={loading} />
              <div ref={chatEndRef} />
            </div>
            <InputBar value={input} onChange={setInput} onSend={() => sendMessage()} loading={loading} error={error}
              placeholder={activeTool.placeholder} modeLabel={activeTool.label} modeColor={activeTool.color}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
          </>
        )}

        {tab === 'kb' && (
          <>
            {!kbMode ? (
              <div className="kb-grid-wrap">
                <div className="kb-grid-label">SELECT A DOMAIN TO EXPLORE</div>
                <div className="kb-grid">
                  {KB_DOMAINS.map(d => (
                    <div key={d.id} className="kb-card" onClick={() => openKB(d.id)}>
                      <div className="kb-card-name">{d.name}</div>
                      <div className="kb-card-desc">{d.desc}</div>
                      <div className="kb-topics">
                        {d.topics.map(t => (
                          <span key={t.label} className="kb-topic" onClick={e => { e.stopPropagation(); openKB(d.id, t.q) }}>{t.label}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="kb-topbar">
                  <button className="kb-back" onClick={() => { setKbMode(null); setKbMessages([]); setError('') }}>← back</button>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', flexShrink: 0 }} />
                  <span className="kb-domain-label">DOMAIN: <span style={{ color: '#00ff88' }}>{activeKB?.name.toUpperCase()}</span></span>
                </div>
                <div className="chat-area">
                  {kbMessages.length === 0 && (
                    <div className="welcome">
                      <div className="welcome-title" style={{ color: '#00ff88' }}>{activeKB?.name}</div>
                      <div className="welcome-sub">Click a topic or type your question</div>
                      <div className="kb-topic-btns">
                        {activeKB?.topics.map(t => (
                          <button key={t.label} className="kb-topic-btn" onClick={() => sendKBMessage(kbMode!, t.q)}>{t.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Messages messages={kbMessages} loading={loading} />
                  <div ref={chatEndRef} />
                </div>
                <InputBar value={input} onChange={setInput} onSend={() => sendMessage()} loading={loading} error={error}
                  placeholder={`Ask anything about ${activeKB?.name}...`} modeLabel={activeKB?.name ?? ''} modeColor="#00ff88"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.2); border-radius: 2px; }
        pre { background: #0d1117!important; border-radius: 6px; padding: 12px; overflow-x: auto; margin: 6px 0; }
        code { font-family: 'JetBrains Mono','Courier New',monospace; font-size: 12px; }
        p { margin-bottom: 6px; line-height: 1.6; }
        ul, ol { padding-left: 18px; margin-bottom: 6px; }
        li { margin-bottom: 3px; }
        h1,h2,h3 { color: #00ff88; margin: 10px 0 5px; }
        strong { color: #00ff88; }
        table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        th, td { border: 0.5px solid rgba(0,255,136,0.15); padding: 6px 10px; font-size: 12px; }
        th { color: #00ff88; }

        .app-wrap { width: 100vw; height: 100vh; height: 100dvh; background: #0a0d12; display: flex; align-items: stretch; justify-content: center; }
        .app-card { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #0a0d12; }

        @media (min-width: 1024px) {
          .app-wrap { padding: 20px; align-items: center; }
          .app-card { max-width: 1100px; height: calc(100vh - 40px); height: calc(100dvh - 40px); border: 0.5px solid rgba(0,255,136,0.15); border-radius: 12px; }
        }

        .app-hdr { background: #0f1318; border-bottom: 0.5px solid rgba(0,255,136,0.12); padding: 10px 14px; display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .app-logo { font-weight: 700; color: #00ff88; letter-spacing: 0.06em; font-size: 15px; }
        .badge-green { font-size: 10px; background: rgba(0,255,136,0.08); border: 0.5px solid rgba(0,255,136,0.2); color: #00ff88; padding: 2px 7px; border-radius: 3px; font-family: monospace; }
        .badge-orange { font-size: 10px; background: rgba(255,107,0,0.1); border: 0.5px solid rgba(255,107,0,0.3); color: #ff6b00; padding: 2px 7px; border-radius: 3px; font-family: monospace; }
        .online-indicator { margin-left: auto; display: flex; align-items: center; gap: 5px; }
        .online-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; animation: pulse 2s ease-in-out infinite; }
        .online-label { font-size: 10px; color: #64748b; font-family: monospace; }

        .app-tabs { display: flex; background: #0f1318; border-bottom: 0.5px solid rgba(0,255,136,0.12); flex-shrink: 0; }
        .tab-btn { flex: 1; padding: 9px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #64748b; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: color 0.15s; }
        .tab-btn:hover { color: #e2e8f0; }
        .tab-active { color: #00ff88 !important; border-bottom-color: #00ff88 !important; }
        @media (min-width: 600px) { .tab-btn { flex: none; } }

        .modebar { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 8px 10px; background: #0f1318; border-bottom: 0.5px solid rgba(0,255,136,0.1); flex-shrink: 0; }
        .mode-btn { display: flex; align-items: center; justify-content: center; gap: 5px; padding: 7px 8px; border-radius: 5px; cursor: pointer; font-size: 11px; font-weight: 700; font-family: inherit; transition: all 0.15s; }
        @media (min-width: 600px) { .modebar { display: flex; flex-wrap: wrap; padding: 8px 14px; } .mode-btn { justify-content: flex-start; padding: 5px 11px; } }

        .chat-area { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 10px; background: #0a0d12; }
        @media (min-width: 768px) { .chat-area { padding: 16px 20px; gap: 12px; } }

        .welcome { text-align: center; padding: 20px 10px; }
        .welcome-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .welcome-sub { font-size: 12px; color: #64748b; margin-bottom: 16px; }
        .suggestions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; text-align: left; }
        @media (max-width: 380px) { .suggestions-grid { grid-template-columns: 1fr; } }
        .suggestion-card { padding: 10px 12px; background: #141920; border: 0.5px solid rgba(0,255,136,0.1); border-radius: 7px; cursor: pointer; }
        .suggestion-card:active { border-color: rgba(0,255,136,0.3); }
        .suggestion-label { font-size: 9px; font-weight: 700; margin-bottom: 3px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.06em; }
        .suggestion-text { font-size: 11px; color: #e2e8f0; line-height: 1.4; }

        .kb-grid-wrap { flex: 1; overflow-y: auto; padding: 12px; background: #0a0d12; }
        @media (min-width: 768px) { .kb-grid-wrap { padding: 16px 20px; } }
        .kb-grid-label { font-size: 10px; color: #64748b; font-family: monospace; margin-bottom: 10px; letter-spacing: 0.06em; }
        .kb-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
        @media (min-width: 480px) { .kb-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 1024px) { .kb-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
        .kb-card { background: #141920; border: 0.5px solid rgba(0,255,136,0.12); border-radius: 8px; padding: 12px; cursor: pointer; transition: border-color 0.15s; }
        .kb-card:active { border-color: rgba(0,255,136,0.3); }
        .kb-card-name { font-weight: 700; font-size: 12px; color: #e2e8f0; margin-bottom: 3px; }
        .kb-card-desc { font-size: 10px; color: #64748b; margin-bottom: 8px; line-height: 1.4; }
        .kb-topics { display: flex; flex-wrap: wrap; gap: 4px; }
        .kb-topic { font-size: 9px; font-family: monospace; padding: 2px 7px; border-radius: 3px; background: rgba(0,255,136,0.06); border: 0.5px solid rgba(0,255,136,0.15); color: rgba(0,255,136,0.8); cursor: pointer; }
        .kb-topic:active { background: rgba(0,255,136,0.14); }

        .kb-topbar { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #0f1318; border-bottom: 0.5px solid rgba(0,255,136,0.1); flex-shrink: 0; }
        .kb-back { font-size: 11px; color: #64748b; background: none; border: none; cursor: pointer; font-family: monospace; padding: 4px 0; transition: color 0.15s; }
        .kb-back:active { color: #00ff88; }
        .kb-domain-label { font-size: 10px; font-family: monospace; color: #64748b; }
        .kb-topic-btns { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
        .kb-topic-btn { font-size: 10px; font-family: monospace; padding: 6px 12px; border-radius: 4px; background: rgba(0,255,136,0.06); border: 0.5px solid rgba(0,255,136,0.2); color: #00ff88; cursor: pointer; }

        .msg-label { font-size: 9px; color: #64748b; font-family: monospace; padding: 0 4px; }
        .msg-bubble { max-width: 92%; padding: 10px 14px; font-size: 13px; line-height: 1.65; color: #e2e8f0; }
        @media (max-width: 480px) { .msg-bubble { max-width: 96%; font-size: 12px; padding: 8px 11px; } }
        .msg-bubble-user { background: rgba(0,255,136,0.08); border: 0.5px solid rgba(0,255,136,0.25); border-radius: 10px 10px 2px 10px; }
        .msg-bubble-ai { background: #141920; border: 0.5px solid rgba(0,255,136,0.12); border-radius: 10px 10px 10px 2px; }
        .typing-bubble { display: flex; align-items: center; gap: 5px; padding: 10px 14px; background: #141920; border: 0.5px solid rgba(0,255,136,0.12); border-radius: 10px 10px 10px 2px; }

        .input-bar { padding: 10px 12px; background: #0f1318; border-top: 0.5px solid rgba(0,255,136,0.1); flex-shrink: 0; }
        @media (min-width: 768px) { .input-bar { padding: 10px 16px; } }
        .input-error { font-size: 11px; color: #f87171; background: rgba(248,113,113,0.08); border: 0.5px solid rgba(248,113,113,0.2); border-radius: 5px; padding: 6px 10px; margin-bottom: 8px; font-family: monospace; }
        .input-meta { font-size: 9px; color: #64748b; font-family: monospace; margin-bottom: 7px; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .input-mode-pill { padding: 1px 7px; border-radius: 3px; font-weight: 700; }
        .input-hint { color: #334155; }
        @media (max-width: 480px) { .input-hint { display: none; } }
        .input-row { display: flex; gap: 8px; align-items: flex-end; }
        .input-textarea { flex: 1; background: #0a0d12; border: 0.5px solid rgba(0,255,136,0.15); border-radius: 7px; padding: 9px 12px; color: #e2e8f0; font-size: 16px; font-family: inherit; resize: none; min-height: 44px; max-height: 120px; line-height: 1.5; outline: none; -webkit-appearance: none; appearance: none; }
        @media (min-width: 768px) { .input-textarea { font-size: 13px; min-height: 38px; } }
        .send-btn { width: 44px; height: 44px; min-width: 44px; border-radius: 7px; border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #0a0d12; cursor: pointer; transition: all 0.15s; }
        @media (min-width: 768px) { .send-btn { width: 38px; height: 38px; min-width: 38px; } }
        .send-btn:active { transform: scale(0.95); }
      `}</style>
    </div>
  )
}

function Messages({ messages, loading }: { messages: Message[]; loading: boolean }) {
  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
          <div className="msg-label">{msg.role === 'user' ? 'YOU' : 'CYBERAI'}</div>
          <div className={`msg-bubble ${msg.role === 'user' ? 'msg-bubble-user' : 'msg-bubble-ai'}`}>
            {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <div className="msg-label">CYBERAI</div>
          <div className="typing-bubble">
            {[0, 1, 2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
          </div>
        </div>
      )}
    </>
  )
}

function InputBar({ value, onChange, onSend, onKeyDown, loading, error, placeholder, modeLabel, modeColor }: {
  value: string; onChange: (v: string) => void; onSend: () => void; onKeyDown: (e: React.KeyboardEvent) => void
  loading: boolean; error: string; placeholder: string; modeLabel: string; modeColor: string
}) {
  return (
    <div className="input-bar">
      {error && <div className="input-error">⚠ {error}</div>}
      <div className="input-meta">
        <span>MODE:</span>
        <span className="input-mode-pill" style={{ background: `${modeColor}20`, color: modeColor }}>{modeLabel.toUpperCase()}</span>
        <span className="input-hint">· Enter to send · Shift+Enter for newline</span>
      </div>
      <div className="input-row">
        <textarea className="input-textarea" value={value} onChange={e => onChange(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1}
          onFocus={e => (e.target.style.borderColor = 'rgba(0,255,136,0.35)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(0,255,136,0.15)')} />
        <button className="send-btn" onClick={onSend} disabled={loading || !value.trim()}
          style={{ background: loading || !value.trim() ? 'rgba(0,255,136,0.3)' : '#00ff88', cursor: loading || !value.trim() ? 'not-allowed' : 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
