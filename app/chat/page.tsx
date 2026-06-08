'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Search, Shield, ArrowUp, Copy, ThumbsUp, ThumbsDown, Menu, Plus } from 'lucide-react'
import { AGENTS, type Agent } from '@/agents'
import { MarkdownMessage } from '@/components/MarkdownMessage'
import { Sidebar } from '@/components/Sidebar'
import SearchSources, { type Source } from '@/components/SearchSources'

type DBSession = { id: string; title: string; created_at: string; updated_at: string }
type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string; sources?: Source[] }

const AGENT_ICONS: Record<Agent, React.ReactNode> = {
  learning: <BookOpen size={12} />,
  research: <Search size={12} />,
  security: <Shield size={12} />,
}

const AGENT_LABELS: { id: Agent; label: string }[] = [
  { id: 'learning', label: 'Learning' },
  { id: 'research', label: 'Research' },
  { id: 'security', label: 'Security' },
]

const AGENT_BADGE_STYLES: Record<Agent, React.CSSProperties> = {
  learning: { background: '#eaf3de', color: '#3b6d11', borderColor: '#c0dd97' },
  research: { background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)', borderColor: 'transparent' },
  security: { background: '#faeeda', color: '#854f0b', borderColor: '#fac775' },
}

const SUGGESTIONS: Record<Agent, string[]> = {
  learning: ['Explain quantum computing basics', 'Help me understand Python decorators', 'Walk me through the water cycle'],
  research: ['Compare REST vs GraphQL', 'Deep dive into transformer architectures', 'Analyze the OSI model layers'],
  security: ['Explain SQL injection prevention', 'Walk through a CTF challenge', 'Describe zero-trust architecture'],
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'; if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function ChatPage() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [sessions, setSessions] = useState<DBSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeAgent, setActiveAgent] = useState<Agent>('learning')
  const [inputValue, setInputValue] = useState('')
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const activeIdRef = useRef<string | null>(null)
  const sendingRef = useRef(false)
  const isNewChatRef = useRef(false)

  useEffect(() => { if (!isSignedIn) router.push('/') }, [isSignedIn, router])
  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  useEffect(() => {
    fetch('/api/sessions').then(r => r.ok ? r.json() : []).then(d => {
      setSessions(Array.isArray(d?.sessions ?? d) ? d.sessions ?? d : [])
    }).catch(() => {}).finally(() => setSessionsLoading(false))
  }, [])

  useEffect(() => {
    if (!activeId) { setMessages([]); return }
    if (isNewChatRef.current) { isNewChatRef.current = false; return }
    setMessagesLoading(true)
    fetch(`/api/message/${activeId}`).then(r => r.ok ? r.json() : null).then(d => {
      setMessages(d?.messages ?? [])
    }).catch(() => setMessages([])).finally(() => setMessagesLoading(false))
  }, [activeId])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function newChat() { setError(''); setActiveId(null); setMessages([]); setInputValue('') }
  function switchSession(id: string) {
    if (id === activeIdRef.current || sendingRef.current) return
    setError(''); setActiveId(id)
  }
  async function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSessions(prev => { const n = prev.filter(s => s.id !== id); if (activeId === id) { setActiveId(n[0]?.id ?? null); setMessages([]) }; return n })
    try { await fetch(`/api/sessions/${id}`, { method: 'DELETE' }) } catch {}
  }
  function handleAgentChange(agent: Agent) { setActiveAgent(agent); setActiveId(null); setMessages([]) }

  function submitMessage(text: string) {
    sendMessage(text); setInputValue('')
    if (inputRef.current) { inputRef.current.value = ''; inputRef.current.style.height = 'auto' }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sendingRef.current) return
    sendingRef.current = true; setIsSending(true); setIsSearching(true); setError('')
    const userMsgId = crypto.randomUUID(); const assistantMsgId = crypto.randomUUID()
    const now = Date.now(); const userTs = new Date(now).toISOString(); const assistantTs = new Date(now + 1).toISOString()
    let chatId = activeIdRef.current; const isNewChat = !chatId

    if (isNewChat) {
      try {
        const res = await fetch('/api/sessions', { method: 'POST' })
        const data = await res.json()
        chatId = (data?.session ?? data).id; activeIdRef.current = chatId; isNewChatRef.current = true
        setActiveId(chatId)
        setSessions(prev => [{ id: chatId, title: content.slice(0, 45) + (content.length > 45 ? '...' : ''), created_at: userTs, updated_at: userTs }, ...prev])
      } catch { setError('Failed to start chat'); setIsSending(false); setIsSearching(false); sendingRef.current = false; return }
    }
    const userMsg: Message = { id: userMsgId, role: 'user', content, created_at: userTs }
    const placeholder: Message = { id: assistantMsgId, role: 'assistant', content: '', created_at: assistantTs }
    setMessages(prev => [...prev, userMsg, placeholder])
    try {
      await fetch(`/api/message/${chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userMsgId, role: 'user', content, created_at: userTs }) })
      await fetch(`/api/message/${chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: assistantMsgId, role: 'assistant', content: '', created_at: assistantTs }) })
    } catch {}

    // Pre-fetch search sources and show them live before the AI responds
    if (activeAgent === 'research' || activeAgent === 'security') {
      fetch('/api/search-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content, agent: activeAgent }),
      }).then(r => r.json()).then(data => {
        const liveSources: Source[] = data.sources ?? []
        if (liveSources.length > 0) {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, sources: liveSources } : m))
        }
      }).catch(() => {})
    }

    try {
      const aiRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages.slice(-7), { role: 'user', content }], agent: activeAgent }) })
      const aiData = await aiRes.json(); const reply = aiData.reply ?? ''; const sources: Source[] = aiData.sources ?? []
      if (!reply) { setError(aiData.error ?? 'No response'); setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId)); setIsSending(false); setIsSearching(false); sendingRef.current = false; return }
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: reply, sources } : m))
      fetch(`/api/message/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: assistantMsgId, content: reply }) }).catch(() => {})
      const title = content.slice(0, 45) + (content.length > 45 ? '...' : '')
      setSessions(prev => prev.map(s => s.id === chatId ? { ...s, title } : s))
      fetch(`/api/sessions/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) }).catch(() => {})
    } catch { setError('Network error') }
    finally { setIsSending(false); setIsSearching(false); sendingRef.current = false }
  }, [messages, activeAgent])

  const agentInfo = AGENTS[activeAgent]
  const hasMessages = messages.length > 0
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content === ''
  const badgeStyle = AGENT_BADGE_STYLES[activeAgent]
  const suggestionCards = SUGGESTIONS[activeAgent]

  return (
    <div className="h-screen w-full flex overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          sessions={sessions} sessionsLoading={sessionsLoading}
          activeId={activeId} activeAgent={activeAgent}
          collapsed={sidebarCollapsed}
          onNewChat={newChat} onSelectSession={switchSession}
          onSelectAgent={handleAgentChange} onDeleteSession={deleteSession}
          onToggleCollapse={() => setSidebarCollapsed(p => !p)}
        />
      </div>

      <div className={`fixed md:hidden top-0 left-0 z-50 h-full transition-transform duration-250 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar
          sessions={sessions} sessionsLoading={sessionsLoading}
          activeId={activeId} activeAgent={activeAgent}
          collapsed={false}
          onNewChat={() => { newChat(); setMobileSidebarOpen(false) }}
          onSelectSession={switchSession}
          onSelectAgent={handleAgentChange} onDeleteSession={deleteSession}
          onToggleCollapse={() => {}}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border)',
      }}>
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between h-[52px] px-4 flex-shrink-0 border-b"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <button onClick={() => setMobileSidebarOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-md"
            style={{ color: 'var(--text-secondary)' }}>
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AETHER</span>
          <button onClick={newChat} className="w-8 h-8 flex items-center justify-center rounded-md"
            style={{ color: 'var(--text-secondary)' }}>
            <Plus size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[740px] mx-auto px-4 md:px-6 py-6">
            {messagesLoading && (
              <div className="space-y-4 py-8">
                {[180, 260, 200].map((w, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className="h-8 rounded-md" style={{ width: w, background: 'var(--bg-tertiary)' }} />
                  </div>
                ))}
              </div>
            )}

            {!messagesLoading && !hasMessages && (
              <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4">
                <span className="text-[26px] font-medium" style={{ color: 'var(--text-primary)' }}>AETHER</span>
                <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Your intelligent learning companion</span>
                <div className="h-10" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[560px]">
                  {suggestionCards.map((s, i) => (
                    <button key={i} onClick={() => submitMessage(s)}
                      className="flex flex-col items-start gap-2 p-4 rounded-[var(--radius-lg)] border text-left text-sm transition-colors cursor-pointer"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}
                    >
                      <span style={{ color: 'var(--text-tertiary)' }}>{AGENT_ICONS[activeAgent]}</span>
                      <span className="text-sm leading-snug line-clamp-2">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!messagesLoading && hasMessages && (
              <div>
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, transform: 'translateY(4px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0)' }}
                    transition={{ duration: 0.15 }}
                    className={`mb-5 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
                    onMouseEnter={() => setHoveredMsgId(msg.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {msg.role === 'user' ? (
                      <div className="inline-block max-w-[75%] md:max-w-[75%] px-4 py-3 text-base leading-relaxed"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--text-primary)', borderRadius: '18px 18px 4px 18px' }}>
                        {msg.content}
                      </div>
                    ) : msg.content ? (
                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }}>
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="inline-flex items-center gap-1 h-5 px-2 rounded-full text-[11px] font-medium border mb-2"
                            style={badgeStyle}>
                            {AGENT_ICONS[activeAgent]}
                            {AGENT_LABELS.find(a => a.id === activeAgent)?.label}
                          </div>
                          {i === messages.length - 1 && isSearching ? (
                            <SearchSources sources={[]} isSearching={true} />
                          ) : msg.sources && msg.sources.length > 0 ? (
                            <SearchSources sources={msg.sources} isSearching={false} />
                          ) : null}
                          <div className="text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                            <MarkdownMessage content={msg.content} />
                          </div>
                          {hoveredMsgId === msg.id && (
                            <div className="flex gap-1 mt-2 transition-opacity" style={{ opacity: hoveredMsgId === msg.id ? 1 : 0 }}>
                              <button onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] border-none cursor-pointer transition-colors"
                                style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}>
                                <Copy size={14} />
                              </button>
                              {(['up', 'down'] as const).map(dir => (
                                <button key={dir}
                                  className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] border-none cursor-pointer transition-colors"
                                  style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}>
                                  {dir === 'up' ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-start">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }}>
                          A
                        </div>
                        <div className="flex-1 pt-2">
                          <span className="inline-block w-[2px] h-4 rounded-sm align-middle" style={{
                            background: 'var(--accent)',
                            animation: 'blink 1s step-end infinite',
                          }} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                {error && (
                  <div className="flex justify-center py-2">
                    <span className="text-xs px-3 py-1.5 rounded-md" style={{ color: 'var(--danger)', background: 'rgba(197,52,52,0.06)' }}>{error}</span>
                  </div>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 flex-shrink-0 border-t" style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
          <div className="max-w-[740px] mx-auto px-4 md:px-6 py-3 md:pb-5">
            <div className="relative rounded-[var(--radius-xl)] border transition-all duration-150"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.10)' }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <textarea
                ref={inputRef}
                className="w-full bg-transparent border-none outline-none resize-none text-base leading-relaxed"
                style={{
                  minHeight: 52, maxHeight: 200,
                  padding: '14px 52px 14px 18px',
                  color: 'var(--text-primary)',
                  caretColor: 'var(--accent)',
                  fontFamily: 'inherit',
                }}
                placeholder="Ask AETHER anything..."
                rows={1}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                  e.currentTarget.style.height = 'auto'
                  e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 200) + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (inputValue.trim() && !isSending) submitMessage(inputValue.trim())
                  }
                }}
                disabled={isSending}
              />
              <button
                onClick={() => { if (inputValue.trim() && !isSending) submitMessage(inputValue.trim()) }}
                disabled={!inputValue.trim() || isSending}
                className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
                style={{
                  background: inputValue.trim() && !isSending ? 'var(--accent)' : 'transparent',
                  border: inputValue.trim() && !isSending ? 'none' : '1px solid var(--border)',
                  color: inputValue.trim() && !isSending ? 'var(--accent-fg)' : 'var(--text-tertiary)',
                }}
              >
                <ArrowUp size={15} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {AGENT_LABELS.map(a => (
                <button key={a.id} onClick={() => handleAgentChange(a.id)}
                  className="inline-flex items-center gap-1 h-7 px-3 rounded-full text-xs font-medium transition-all cursor-pointer border"
                  style={
                    activeAgent === a.id
                      ? { background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)', borderColor: 'transparent' }
                      : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                  }>
                  {AGENT_ICONS[a.id]}
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
