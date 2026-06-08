'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useUsage } from '@/hooks/useUsage'
import { motion } from 'framer-motion'
import { BookOpen, Search, Shield, ArrowUp, Copy, RefreshCw, Menu, Plus, Globe } from 'lucide-react'
import { AGENTS, type Agent } from '@/agents'
import { MarkdownMessage } from '@/components/MarkdownMessage'
import { Sidebar } from '@/components/Sidebar'
import { OnboardingModal } from '@/components/OnboardingModal'
import { CommandPalette } from '@/components/CommandPalette'
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
  learning: ['Explain recursion with a real example', 'Help me prepare for my OS exam', 'Break down the French Revolution'],
  research: ['Compare REST vs GraphQL in depth', 'What are the latest trends in LLM fine-tuning', 'Analyze pros and cons of microservices'],
  security: ['Triage this suspicious login alert', 'Map this IOC to MITRE ATT&CK', 'Generate a Splunk query for failed SSH logins'],
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
  const { usage, loading: usageLoading, syncUsage } = useUsage()
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
  const [isMobile, setIsMobile] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [forceSearch, setForceSearch] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    if (localStorage.getItem('sentinel_onboarding_done') === 'true') {
      setOnboardingChecked(true)
      return
    }
    console.log('[ChatPage] checking onboarding status...')
    fetch('/api/onboarding').then(r => r.json()).then(data => {
      console.log('[ChatPage] onboarding check result:', data)
      if (data.needsOnboarding) setShowOnboarding(true)
    }).catch(() => {}).finally(() => setOnboardingChecked(true))
  }, [isSignedIn])

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

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); return }
      if (e.key === 'Escape') { setShowCommandPalette(false); setMobileSidebarOpen(false); return }
      if (isMod && e.key === 'n') { e.preventDefault(); newChat(); return }
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === '1') handleAgentChange('learning')
      else if (e.key === '2') handleAgentChange('research')
      else if (e.key === '3') handleAgentChange('security')
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  })

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
        setSessions(prev => [{ id: chatId, title: 'New Chat', created_at: userTs, updated_at: userTs }, ...prev])
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
    if (forceSearch || activeAgent === 'research' || activeAgent === 'security') {
      fetch('/api/search-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content, agent: activeAgent, forceSearch }),
      }).then(r => r.json()).then(data => {
        const liveSources: Source[] = data.sources ?? []
        if (liveSources.length > 0) {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, sources: liveSources } : m))
        }
      }).catch(() => {})
    }

    try {
      const aiRes = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages.slice(-7), { role: 'user', content }], agent: activeAgent, forceSearch }) })
      const aiData = await aiRes.json(); const reply = aiData.reply ?? ''; const sources: Source[] = aiData.sources ?? []
      if (!reply) { setError(aiData.error ?? 'No response'); setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId)); setIsSending(false); setIsSearching(false); sendingRef.current = false; return }
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: reply, sources } : m))
      if (aiData.usage) syncUsage(aiData.usage)
      fetch(`/api/message/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: assistantMsgId, content: reply }) }).catch(() => {})
      if (isNewChat) {
        fetch('/api/chat/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content }),
        }).then(r => r.json()).then(data => {
          const genTitle = data.title || 'New Chat'
          setSessions(prev => prev.map(s => s.id === chatId ? { ...s, title: genTitle } : s))
          fetch(`/api/sessions/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: genTitle }) }).catch(() => {})
        }).catch(() => {})
      } else {
        const title = content.slice(0, 45) + (content.length > 45 ? '...' : '')
        setSessions(prev => prev.map(s => s.id === chatId ? { ...s, title } : s))
        fetch(`/api/sessions/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) }).catch(() => {})
      }
    } catch { setError('Network error') }
    finally { setIsSending(false); setIsSearching(false); sendingRef.current = false }
  }, [messages, activeAgent])

  async function regenerateMessage(assistantId: string, userContent: string) {
    if (sendingRef.current) return
    sendingRef.current = true; setIsSending(true); setIsSearching(true); setError('')
    setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: '', sources: undefined } : m))
    try {
      const aiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userContent }], agent: activeAgent, forceSearch }),
      })
      const aiData = await aiRes.json()
      const reply = aiData.reply ?? ''
      if (!reply) { throw new Error(aiData.error ?? 'No response') }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: reply, sources: aiData.sources ?? [] } : m))
      if (aiData.usage) syncUsage(aiData.usage)
      if (activeIdRef.current) {
        fetch(`/api/message/${activeIdRef.current}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: assistantId, content: reply }) }).catch(() => {})
      }
    } catch { setError('Failed to regenerate') }
    finally { setIsSending(false); setIsSearching(false); sendingRef.current = false }
  }

  const agentInfo = AGENTS[activeAgent]
  const hasMessages = messages.length > 0
  const isStreaming = messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content === ''
  const badgeStyle = AGENT_BADGE_STYLES[activeAgent]
  const suggestionCards = SUGGESTIONS[activeAgent]

  return (
    <div className="w-full flex overflow-hidden" style={{ height: '100dvh', background: 'var(--bg-secondary)' }}>
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
          usage={usage} usageLoading={usageLoading}
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
          usage={usage} usageLoading={usageLoading}
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
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
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
                <span className="text-[26px] font-medium" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
                <span className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Your intelligent learning companion</span>
                <div className="h-10" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[560px]">
                  {suggestionCards.map((s, i) => (
                    <button key={i} onClick={() => submitMessage(s)}
                      className="flex flex-col items-start gap-1.5 p-3.5 md:p-4 rounded-[var(--radius-lg)] border text-left text-sm transition-colors cursor-pointer"
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
                          {(isMobile || hoveredMsgId === msg.id) && (
                            <div className="flex gap-1 mt-2">
                              <button onClick={() => navigator.clipboard.writeText(msg.content)}
                                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] border-none cursor-pointer transition-colors"
                                style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}>
                                <Copy size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  let idx = i - 1
                                  while (idx >= 0 && messages[idx].role !== 'user') idx--
                                  if (idx >= 0) regenerateMessage(msg.id, messages[idx].content)
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] border-none cursor-pointer transition-colors"
                                style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}>
                                <RefreshCw size={14} />
                              </button>
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
                        <div className="flex items-center gap-1 pt-2 pl-0.5">
                          <span className="inline-block w-[5px] h-[5px] rounded-full" style={{
                            background: 'var(--text-tertiary)',
                            animation: 'typingDot 1.4s ease-in-out infinite',
                            animationDelay: '0s',
                          }} />
                          <span className="inline-block w-[5px] h-[5px] rounded-full" style={{
                            background: 'var(--text-tertiary)',
                            animation: 'typingDot 1.4s ease-in-out infinite',
                            animationDelay: '0.2s',
                          }} />
                          <span className="inline-block w-[5px] h-[5px] rounded-full" style={{
                            background: 'var(--text-tertiary)',
                            animation: 'typingDot 1.4s ease-in-out infinite',
                            animationDelay: '0.4s',
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
                placeholder="Ask SENTINEL anything..."
                rows={1}
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                  e.currentTarget.style.height = 'auto'
                  e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 200) + 'px'
                }}
                onKeyDown={e => {
                  if ((e.key === 'Enter' && !e.shiftKey) || ((e.metaKey || e.ctrlKey) && e.key === 'Enter')) {
                    e.preventDefault()
                    if (inputValue.trim() && !isSending) submitMessage(inputValue.trim())
                  }
                }}
                disabled={isSending}
              />
              <button
                onClick={() => setForceSearch(p => !p)}
                className="absolute bottom-2.5 right-11 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
                style={{
                  background: forceSearch ? 'rgba(124,106,247,0.12)' : 'transparent',
                  border: forceSearch ? '1px solid var(--accent)' : '1px solid var(--border)',
                  color: forceSearch ? 'var(--accent)' : 'var(--text-tertiary)',
                }}
                title={forceSearch ? 'Web search on' : 'Web search off'}
              >
                <Globe size={14} />
              </button>
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

            <div className="flex items-center gap-2 mt-2.5">
              <span className="hidden md:inline text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                ⌘K for shortcuts
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto flex-1 md:flex-none md:justify-end scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
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
        </div>
      </main>

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  )
}
