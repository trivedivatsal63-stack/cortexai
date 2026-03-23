'use client'
import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { UserButton } from '@clerk/nextjs'
import { useUsage } from '@/hooks/useUsage'
import { LimitReachedModal } from '@/components/LimitReachedModal'
import { AIMessage } from '@/components/AIMessage'
import type { UsageStatus } from '@/lib/usage-tracker'

type Message = { id?: string; role: 'user' | 'assistant'; content: string; created_at?: string }
type ToolMode = 'log' | 'kali' | 'bug' | 'script'
type KBMode = 'os' | 'net' | 'malware' | 'crypto' | 'web' | 'forensics' | 're' | 'ctf'
type ChatMode = 'general' | 'tools' | 'kb'
type DBSession = { id: string; title: string; created_at: string; updated_at: string }

const TOOL_MODES = [
    { id: 'log' as ToolMode, label: 'Log Analysis', color: '#4f8ef7' },
    { id: 'kali' as ToolMode, label: 'Kali Tools', color: '#a78bfa' },
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
const CHAT_MODE_OPTIONS: [ChatMode, string][] = [
    ['general', 'General'],
    ['tools', 'Tools'],
    ['kb', 'Knowledge Base'],
]
const SUGGESTIONS = [
    { title: 'SQL Injection', desc: 'Attack examples and prevention explained visually', q: 'Explain SQL Injection visually with examples' },
    { title: 'OOP in C++', desc: 'Classes, inheritance, polymorphism with code', q: 'Teach me OOP concepts in C++ with examples' },
    { title: 'DCN Exam Prep', desc: 'OSI model, TCP/IP, routing protocols', q: 'Prepare me for DCN exam — OSI and TCP/IP layers' },
    { title: 'OS Notes', desc: 'Process scheduling, memory management, deadlocks', q: 'Create OS process scheduling notes' },
    { title: 'Buffer Overflow', desc: 'Stack memory, exploit mechanics, defences', q: 'Explain buffer overflow attack simply' },
    { title: 'Turing Machine', desc: 'Theory of computation fundamentals', q: 'What is a Turing machine and how does it work?' },
]

function groupByDate(sessions: DBSession[]) {
    const now = Date.now()
    const today: DBSession[] = [], week: DBSession[] = [], older: DBSession[] = []
    for (const s of sessions ?? []) {
        if (!s?.updated_at) continue
        const diff = now - new Date(s.updated_at).getTime()
        if (diff < 86_400_000) today.push(s)
        else if (diff < 604_800_000) week.push(s)
        else older.push(s)
    }
    return { today, week, older }
}

function exportAsMarkdown(title: string, messages: Message[]) {
    const lines = [`# ${title}`, `_Exported from CortexAI — ${new Date().toLocaleString()}_`, '']
    for (const m of messages) { lines.push(`## ${m.role === 'user' ? '👤 You' : '⚡ CortexAI'}`, m.content, '') }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' }))
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.md`; a.click()
}
function exportAsText(title: string, messages: Message[]) {
    const lines = [`CortexAI Chat — ${title}`, `Exported: ${new Date().toLocaleString()}`, '='.repeat(60), '']
    for (const m of messages) { lines.push(`[${m.role === 'user' ? 'YOU' : 'CortexAI'}]`, m.content, '') }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }))
    a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`; a.click()
}

function UsageBar({ usage, loading }: { usage: UsageStatus | null; loading: boolean }) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        if (loading || !usage) return
        const timer = window.setInterval(() => setNow(Date.now()), 60_000)
        return () => window.clearInterval(timer)
    }, [loading, usage])
    if (loading || !usage) return null
    const pct = usage.percentUsed
    const color = pct >= 90 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#7c6af7'
    const countdown = (() => {
        const diff = new Date(usage.resetAt).getTime() - now
        if (diff <= 0) return 'soon'
        const h = Math.floor(diff / 3_600_000), m = Math.floor((diff % 3_600_000) / 60_000)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    })()
    return (
        <div className="usage-bar">
            <div className="usage-bar-hdr"><span>Queries</span><span style={{ color, fontWeight: 600 }}>{usage.used}/{usage.limit}</span></div>
            <div className="usage-track"><div className="usage-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }} /></div>
            <div className="usage-reset">Resets in {countdown}</div>
        </div>
    )
}

function TypingIndicator() {
    return (
        <div className="typing-row">
            <div className="typing-av">⚡</div>
            <div className="typing-dots"><span /><span /><span /></div>
        </div>
    )
}

// Stable message item — same DOM node from typing→filled, never remounts
const MessageItem = memo(function MessageItem({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user'
    const isEmpty = msg.content === ''
    
    if (isUser) {
        return (
            <div className="msg-user" data-id={msg.id}>
                <div className="msg-user-bub">{msg.content}</div>
            </div>
        )
    }
    return (
        <div className="msg-ai" data-id={msg.id}>
            {isEmpty ? <TypingIndicator /> : <AIMessage content={msg.content} />}
        </div>
    )
}, (prev, next) => {
    // Stable comparison: only re-render when content actually changes
    return prev.msg.id === next.msg.id && prev.msg.content === next.msg.content
})

interface InputBoxProps {
    isAtLimit: boolean
    isSending: boolean
    chatMode: ChatMode
    activeTool: typeof TOOL_MODES[0] | undefined
    activeKB: typeof KB_DOMAINS[0] | undefined
    onSend: (text: string) => void
}

const InputBox = memo(function InputBox({ isAtLimit, isSending, chatMode, activeTool, activeKB, onSend }: InputBoxProps) {
    const [value, setValue] = useState('')
    const ref = useRef<HTMLTextAreaElement>(null)
    const onSendRef = useRef(onSend)
    useEffect(() => { onSendRef.current = onSend }, [onSend])

    function resize() {
        if (!ref.current) return
        ref.current.style.height = 'auto'
        ref.current.style.height = Math.min(ref.current.scrollHeight, 130) + 'px'
    }
    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) { setValue(e.target.value); resize() }
    function handleKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }
    function submit() {
        const trimmed = value.trim()
        if (!trimmed || isAtLimit) return
        onSendRef.current(trimmed)
        setValue('')
        if (ref.current) { ref.current.style.height = '28px'; ref.current.focus() }
    }
    function prefill(text: string) { setValue(text); ref.current?.focus(); setTimeout(resize, 0) }

    const placeholder = isAtLimit
        ? 'Daily limit reached — resets at midnight UTC'
        : chatMode === 'general' ? 'Message CortexAI...'
            : chatMode === 'tools' ? `Ask about ${activeTool?.label}...`
                : `Ask about ${activeKB?.name}...`

    return (
        <div className="input-card">
            <textarea
                ref={ref}
                className="input-ta"
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isAtLimit}
                placeholder={placeholder}
            />
            <div className="input-actions">
                <div className="ia-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                </div>
                <button className="ia-btn" onClick={() => prefill('Create an image of ')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    Create an image
                </button>
                <button className="ia-btn" onClick={() => prefill('Search the web for ')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    Search the web
                </button>
                <button className="ia-send" onClick={submit} disabled={isSending || !value.trim() || isAtLimit}>
                    {isSending
                        ? <div className="ia-spin" />
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    }
                </button>
            </div>
        </div>
    )
}, (prev, next) =>
    prev.isAtLimit === next.isAtLimit &&
    prev.isSending === next.isSending &&
    prev.chatMode === next.chatMode &&
    prev.activeTool?.id === next.activeTool?.id &&
    prev.activeKB?.id === next.activeKB?.id
)

export default function CortexAI() {
    const [sessions, setSessions] = useState<DBSession[]>([])
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showExport, setShowExport] = useState(false)
    const [showLimitModal, setShowLimitModal] = useState(false)
    const [chatMode, setChatMode] = useState<ChatMode>('general')
    const [toolMode, setToolMode] = useState<ToolMode>('log')
    const [kbMode, setKbMode] = useState<KBMode>('web')
    const [navTab, setNavTab] = useState<string>('home')

    // showChat: NEVER depends on messagesLoading - only on actual message content
    // This prevents the "throwback" effect when switching sessions
    const showChat = messages.length > 0

    const chatScrollRef = useRef<HTMLDivElement>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    const activeSessionRef = useRef<DBSession | null>(null)
    const activeIdRef = useRef<string | null>(null)
    const sendingRef = useRef(false)
    const messagesRef = useRef<Message[]>([])
    const isNearBottomRef = useRef(true)
    const scrollPendingRef = useRef(false)

    const { usage, loading: usageLoading, syncUsage, isAtLimit } = useUsage()
    const usageRef = useRef(usage)
    useEffect(() => { usageRef.current = usage }, [usage])

    const activeSession = sessions?.find(s => s?.id === activeId) ?? null
    activeSessionRef.current = activeSession
    activeIdRef.current = activeId

    const activeTool = TOOL_MODES.find(m => m.id === toolMode)
    const activeKB = KB_DOMAINS.find(d => d.id === kbMode)
    const grouped = groupByDate(sessions ?? [])

    useEffect(() => { messagesRef.current = messages }, [messages])

    // Debounced scroll to bottom - prevents multiple scroll calls causing layout shift
    const scrollToBottom = useCallback(() => {
        if (scrollPendingRef.current) return
        scrollPendingRef.current = true
        
        requestAnimationFrame(() => {
            scrollPendingRef.current = false
            if (chatEndRef.current && chatScrollRef.current) {
                chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
            }
        })
    }, [])

    useEffect(() => {
        const el = chatScrollRef.current
        if (!el) return
        const onScroll = () => {
            isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        fetch('/api/sessions')
            .then(r => r.ok ? r.json() : [])
            .then(data => { const s = data?.sessions ?? data ?? []; setSessions(Array.isArray(s) ? s : []) })
            .catch(() => setSessions([]))
            .finally(() => setSessionsLoading(false))
    }, [])

    const loadMessages = useCallback((chatId: string) => {
        // Skip if no chat ID or if sending
        if (!chatId || sendingRef.current) return
        
        setMessagesLoading(true)
        fetch(`/api/message/${chatId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => { 
                if (d?.messages?.length > 0) {
                    setMessages(d.messages)
                } else {
                    setMessages([])
                }
            })
            .catch(() => setMessages([]))
            .finally(() => setMessagesLoading(false))
    }, [])

    useEffect(() => {
        if (activeId) {
            // Clear current messages immediately, then load new session
            setMessages([])
            loadMessages(activeId)
        } else {
            // Only clear messages if we're not in the middle of sending
            if (!sendingRef.current) {
                setMessages([])
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeId])

    async function newChat() {
        setError(''); setMobileOpen(false)
        setActiveId(null); setMessages([])
    }

    function switchSession(id: string) {
        if (id === activeIdRef.current) return
        setError('')
        setShowExport(false)
        setMobileOpen(false)
        // Clear messages immediately before switching
        if (id !== activeId) {
            setMessages([])
        }
        setActiveId(id)
    }

    async function deleteSession(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        const next = sessions.filter(s => s.id !== id)
        setSessions(next)
        if (activeId === id) { setActiveId(next[0]?.id ?? null); setMessages([]) }
        try {
            const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
        } catch { setError('Failed to delete'); setSessions(sessions); if (activeId === id) setActiveId(id) }
    }

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return
        if (sendingRef.current) return
        sendingRef.current = true

        const currentUsage = usageRef.current
        if (currentUsage && !currentUsage.allowed) {
            setShowLimitModal(true)
            sendingRef.current = false
            return
        }

        setError('')
        setIsSending(true)

        // Generate IDs BEFORE state updates to ensure stable references
        const effectiveMode = chatMode === 'tools' ? toolMode : chatMode === 'kb' ? kbMode : 'general'
        const userMsgId = crypto.randomUUID()
        const assistantMsgId = crypto.randomUUID()
        const userMsg: Message = { role: 'user', content, id: userMsgId }
        const assistantPlaceholder: Message = { role: 'assistant', content: '', id: assistantMsgId }

        // CRITICAL: Append BOTH messages in a SINGLE setState call
        // This ensures atomic update - React renders user first, then assistant
        // No intermediate state where only one message exists
        setMessages(prev => [...prev, userMsg, assistantPlaceholder])
        
        // Scroll AFTER the batched state update
        scrollToBottom()

        let chatId = activeIdRef.current
        let isNewSession = false

        if (!chatId) {
            try {
                const res = await fetch('/api/sessions', { method: 'POST' })
                if (!res.ok) throw new Error('session')
                const data = await res.json()
                const session = data?.session ?? data
                if (!session?.id) throw new Error('no id')
                chatId = session.id
                isNewSession = true
                activeIdRef.current = chatId
                setActiveId(chatId)
                setSessions(prev => [session, ...(prev ?? [])])
            } catch {
                setError('Failed to start chat. Please try again.')
                // Remove only the messages we just added
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId))
                setIsSending(false)
                sendingRef.current = false
                return
            }
        }

        const contextMessages = [
            ...messagesRef.current.slice(-7),
            { role: 'user' as const, content }
        ]
        try {
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: contextMessages, mode: effectiveMode }),
            })
            const aiData = await aiRes.json()

            if (aiRes.status === 429 && aiData.error === 'limit_exceeded') {
                if (aiData.usage) syncUsage(aiData.usage)
                setShowLimitModal(true)
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId))
                setIsSending(false)
                sendingRef.current = false
                return
            }
            if (aiRes.status === 429) {
                setError('Rate limit reached. Wait 60 seconds.')
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId))
                setIsSending(false)
                sendingRef.current = false
                return
            }

            const reply: string = aiData.reply ?? ''
            if (!reply) { 
                setError(aiData.error ?? 'No response. Please try again.')
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId))
                setIsSending(false)
                sendingRef.current = false
                return
            }

            if (aiData.usage) syncUsage(aiData.usage)

            // CRITICAL: Replace placeholder content in-place
            // This updates the EXISTING message DOM node - no new message created
            // No re-ordering possible because we're modifying, not adding
            setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: reply } : m)
            )
            
            // Scroll after content update
            scrollToBottom()

            // Fire and forget - don't wait for persistence
            Promise.allSettled([
                fetch(`/api/message/${chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'user', content }) }),
                fetch(`/api/message/${chatId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'assistant', content: reply }) }),
            ])

            const currentSession = activeSessionRef.current
            const shouldTitle = isNewSession || !currentSession?.title || currentSession.title === 'New Chat'
            if (shouldTitle) {
                const newTitle = content.slice(0, 45) + (content.length > 45 ? '...' : '')
                setSessions(prev => prev.map(s => s.id === chatId ? { ...s, title: newTitle, updated_at: new Date().toISOString() } : s))
                fetch(`/api/sessions/${chatId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) }).catch(() => { })
            } else {
                setSessions(prev => { const s = prev.find(x => x.id === chatId); if (!s) return prev; return [{ ...s, updated_at: new Date().toISOString() }, ...prev.filter(x => x.id !== chatId)] })
            }
        } catch { 
            setError('Network error. Check your connection.') 
            setMessages(prev => prev.filter(m => m.id !== assistantMsgId))
        }
        finally {
            setIsSending(false)
            sendingRef.current = false
        }
    }, [chatMode, toolMode, kbMode, syncUsage, scrollToBottom])

    return (
        <div className="root" onClick={() => setShowExport(false)}>
            {mobileOpen && <div className="mob-overlay" onClick={() => setMobileOpen(false)} />}

            {/* SIDEBAR */}
            <aside className={`sidebar ${!sidebarOpen ? 'sidebar-off' : ''} ${mobileOpen ? 'mob-show' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="sb-logo">
                    <div className="sb-logo-icon">⚡</div>
                    <span className="sb-logo-name">CortexAI</span>
                </div>
                <div className="sb-search">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a5578" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Search chats" />
                    <span className="sb-kbd">⌘K</span>
                </div>
                <div className="sb-nav">
                    {([
                        ['home', 'Home', 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10'],
                        ['templates', 'Templates', 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z'],
                        ['explore', 'Explore', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
                        ['history', 'History', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2'],
                    ] as [string, string, string][]).map(([id, label, path]) => (
                        <div key={id} className={`sb-nav-item ${navTab === id ? 'sb-nav-on' : ''}`} onClick={() => setNavTab(id)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d={path} /></svg>
                            {label}
                        </div>
                    ))}
                </div>
                <div className="sb-divider" />
                <div className="sb-recents">
                    {sessionsLoading && [1, 2, 3, 4].map(i => <div key={i} className="sb-skel" />)}
                    {!sessionsLoading && sessions.length === 0 && <div className="sb-empty">No conversations yet</div>}
                    {!sessionsLoading && grouped.today.length > 0 && <>
                        <div className="sb-group-lbl">Today</div>
                        {grouped.today.map(s => (
                            <div key={s.id} className={`sb-item ${activeId === s.id ? 'sb-item-on' : ''}`} onClick={() => switchSession(s.id)}>
                                <span className="sb-item-t">{s.title}</span>
                                <button className="sb-item-del" onClick={e => deleteSession(s.id, e)}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>
                        ))}
                    </>}
                    {!sessionsLoading && grouped.week.length > 0 && <>
                        <div className="sb-group-lbl">This week</div>
                        {grouped.week.map(s => (
                            <div key={s.id} className={`sb-item ${activeId === s.id ? 'sb-item-on' : ''}`} onClick={() => switchSession(s.id)}>
                                <span className="sb-item-t">{s.title}</span>
                                <button className="sb-item-del" onClick={e => deleteSession(s.id, e)}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>
                        ))}
                    </>}
                    {!sessionsLoading && grouped.older.length > 0 && <>
                        <div className="sb-group-lbl">Older</div>
                        {grouped.older.map(s => (
                            <div key={s.id} className={`sb-item ${activeId === s.id ? 'sb-item-on' : ''}`} onClick={() => switchSession(s.id)}>
                                <span className="sb-item-t">{s.title}</span>
                                <button className="sb-item-del" onClick={e => deleteSession(s.id, e)}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>
                        ))}
                    </>}
                </div>
                <div className="sb-bottom">
                    <UsageBar usage={usage} loading={usageLoading} />
                    <a href="/pricing" className="sb-upgrade">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        Upgrade to Pro
                    </a>
                    <div className="sb-profile">
                        <UserButton />
                        <a href="/about" className="sb-about">About</a>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <div className="main">
                <header className="topbar" onClick={e => e.stopPropagation()}>
                    <button className="tb-toggle" onClick={() => { setSidebarOpen(p => !p); setMobileOpen(p => !p) }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    </button>
                    <div className="tb-modes">
                        {CHAT_MODE_OPTIONS.map(([m, label]) => (
                            <button key={m} className={`tb-mode ${chatMode === m ? 'tb-mode-on' : ''}`} onClick={() => setChatMode(m)}>{label}</button>
                        ))}
                    </div>
                    <div className="tb-right">
                        {showChat && messages.length > 0 && (
                            <div style={{ position: 'relative' }}>
                                <button className="tb-btn" onClick={e => { e.stopPropagation(); setShowExport(p => !p) }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Export
                                </button>
                                {showExport && (
                                    <div className="export-menu" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => { exportAsMarkdown(activeSession?.title ?? 'chat', messages); setShowExport(false) }}>Export as Markdown</button>
                                        <button onClick={() => { exportAsText(activeSession?.title ?? 'chat', messages); setShowExport(false) }}>Export as Text</button>
                                    </div>
                                )}
                            </div>
                        )}
                        <button className="tb-btn" onClick={newChat}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            New chat
                        </button>
                    </div>
                </header>

                {chatMode === 'tools' && (
                    <div className="subbar">
                        {TOOL_MODES.map(m => (
                            <button key={m.id} className={`sub-btn ${toolMode === m.id ? 'sub-on' : ''}`} onClick={() => setToolMode(m.id)}>{m.label}</button>
                        ))}
                    </div>
                )}
                {chatMode === 'kb' && (
                    <div className="subbar">
                        {KB_DOMAINS.map(d => (
                            <button key={d.id} className={`sub-btn ${kbMode === d.id ? 'sub-on' : ''}`} onClick={() => setKbMode(d.id)}>{d.name}</button>
                        ))}
                    </div>
                )}

                {/* ── KEY FIX: single always-mounted content area ───────────────────────
                    Both welcome and chat live inside ONE flex column that is always in
                    the DOM. Switching between them is pure CSS (display/flex changes),
                    NOT a React mount/unmount. This means:
                    - chat-scroll is never remounted
                    - messages array is never painted into a freshly-mounted node
                    - there is no frame where the assistant message exists before the user message
                ──────────────────────────────────────────────────────────────────────── */}
                <div className="content-area">

                    {/* WELCOME — hidden via CSS when chat is active, never unmounted */}
                    <div className={`welcome${showChat ? ' welcome-hidden' : ''}`}>
                        <div className="orb-wrap">
                            <div className="orb-blur" />
                            <div className="orb" />
                        </div>
                        <h1 className="welcome-h">Good evening, Student.<br />Can I help you with anything?</h1>
                        <InputBox
                            isAtLimit={isAtLimit}
                            isSending={isSending}
                            chatMode={chatMode}
                            activeTool={activeTool}
                            activeKB={activeKB}
                            onSend={sendMessage}
                        />
                        <div className="sug-grid">
                            {SUGGESTIONS.map((s, i) => (
                                <div key={i} className="sug-card" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => sendMessage(s.q)}>
                                    <div className="sug-title">{s.title}</div>
                                    <div className="sug-desc">{s.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CHAT — hidden via CSS when welcome is active, never unmounted */}
                    <div className={`chat-area${showChat ? '' : ' chat-area-hidden'}`}>
                        <div className="chat-scroll" ref={chatScrollRef}>
                            <div className="chat-inner">
                                {messagesLoading && (
                                    <div className="skel-wrap">
                                        {[280, 420, 200, 360].map((w, i) => (
                                            <div key={i} className={`skel-msg ${i % 2 === 0 ? 'skel-u' : ''}`}>
                                                <div className="skel-lbl" />
                                                <div className="skel-line" style={{ width: w }} />
                                                {i % 2 !== 0 && <div className="skel-line" style={{ width: w * 0.65 }} />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!messagesLoading && messages.map(msg => (
                                    <MessageItem key={msg.id} msg={msg} />
                                ))}
                                {error && <div className="error-bar">⚠ {error}</div>}
                                <div ref={chatEndRef} />
                            </div>
                        </div>
                        <div className="chat-input-bar">
                            <InputBox
                                isAtLimit={isAtLimit}
                                isSending={isSending}
                                chatMode={chatMode}
                                activeTool={activeTool}
                                activeKB={activeKB}
                                onSend={sendMessage}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {showLimitModal && usage && (
                <LimitReachedModal usage={usage} onDismiss={() => setShowLimitModal(false)} />
            )}

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;overflow:hidden;}

        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes orb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes orb-glow{0%,100%{box-shadow:0 0 60px rgba(150,120,255,.35),0 0 120px rgba(100,80,200,.15)}50%{box-shadow:0 0 80px rgba(180,140,255,.5),0 0 160px rgba(120,100,220,.25)}}
        @keyframes shimmer{0%,100%{opacity:.2}50%{opacity:.45}}
        @keyframes blink{0%,80%,100%{opacity:.15;transform:scale(.7)}40%{opacity:1;transform:scale(1)}}
        @keyframes card-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}

        .root{display:flex;width:100vw;height:100dvh;background:#0c0c0f;color:#f0f0f5;font-family:'Outfit',sans-serif;font-size:15px;line-height:1.7;overflow:hidden;}

        .sidebar{width:260px;min-width:260px;height:100%;background:#111116;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;transition:width .2s,min-width .2s;overflow:hidden;flex-shrink:0;}
        .sidebar-off{width:0!important;min-width:0!important;}
        .sb-logo{display:flex;align-items:center;gap:10px;padding:20px 20px 16px;flex-shrink:0;}
        .sb-logo-icon{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#7c6af7,#4f8ef7);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
        .sb-logo-name{font-size:17px;font-weight:700;color:#f0f0f5;letter-spacing:-.01em;}
        .sb-search{display:flex;align-items:center;gap:8px;margin:0 14px 12px;padding:7px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);flex-shrink:0;}
        .sb-search input{flex:1;background:none;border:none;outline:none;font-family:inherit;font-size:13px;color:#8a8a9a;}
        .sb-search input::placeholder{color:#44445a;}
        .sb-kbd{font-size:10px;color:#44445a;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:4px;padding:1px 5px;font-family:'JetBrains Mono',monospace;}
        .sb-nav{padding:0 10px;flex-shrink:0;}
        .sb-nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;color:#8a8a9a;font-size:13.5px;cursor:pointer;transition:all .15s;margin-bottom:2px;}
        .sb-nav-item:hover{background:rgba(255,255,255,0.05);color:#f0f0f5;}
        .sb-nav-on{background:rgba(255,255,255,0.06)!important;color:#f0f0f5!important;}
        .sb-divider{height:1px;background:rgba(255,255,255,0.06);margin:8px 14px;}
        .sb-recents{flex:1;overflow-y:auto;padding:4px 10px;}
        .sb-recents::-webkit-scrollbar{width:3px;}
        .sb-recents::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:2px;}
        .sb-group-lbl{font-size:10.5px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#44445a;padding:10px 8px 4px;}
        .sb-skel{height:22px;border-radius:7px;background:rgba(255,255,255,0.05);margin-bottom:5px;animation:shimmer 1.5s ease-in-out infinite;}
        .sb-empty{font-size:12px;color:#44445a;padding:14px 8px;}
        .sb-item{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;transition:background .12s;margin-bottom:1px;}
        .sb-item:hover{background:rgba(255,255,255,0.05);}
        .sb-item-on{background:rgba(255,255,255,0.06)!important;}
        .sb-item-t{flex:1;font-size:12.5px;color:#8a8a9a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.5;}
        .sb-item-on .sb-item-t{color:#f0f0f5;}
        .sb-item-del{opacity:0;background:none;border:none;color:#44445a;cursor:pointer;padding:2px;border-radius:4px;display:flex;align-items:center;transition:all .12s;flex-shrink:0;}
        .sb-item:hover .sb-item-del{opacity:1;}
        .sb-item-del:hover{color:#ef4444;background:rgba(239,68,68,.08);}
        .sb-bottom{padding:10px 12px 14px;border-top:1px solid rgba(255,255,255,0.06);flex-shrink:0;}
        .usage-bar{margin-bottom:10px;}
        .usage-bar-hdr{display:flex;justify-content:space-between;font-size:11px;color:#44445a;margin-bottom:5px;}
        .usage-track{height:3px;border-radius:2px;background:rgba(255,255,255,0.07);overflow:hidden;margin-bottom:3px;}
        .usage-fill{height:100%;border-radius:2px;transition:width .4s,background .4s;}
        .usage-reset{font-size:10px;color:#44445a;}
        .sb-upgrade{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;font-size:12.5px;font-weight:600;color:#c4b5fd;text-decoration:none;transition:background .14s;margin-bottom:8px;background:rgba(124,106,247,0.1);border:1px solid rgba(124,106,247,0.2);}
        .sb-upgrade:hover{background:rgba(124,106,247,0.18);box-shadow:0 0 12px rgba(124,106,247,.25);}
        .sb-profile{display:flex;align-items:center;justify-content:space-between;padding:2px 2px 0;}
        .sb-about{font-size:11px;color:#44445a;text-decoration:none;transition:color .14s;}
        .sb-about:hover{color:#8a8a9a;}

        .main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;background:radial-gradient(ellipse at 55% 0%,rgba(124,106,247,.06) 0%,transparent 55%),radial-gradient(ellipse at 20% 100%,rgba(79,142,247,.04) 0%,transparent 55%);}
        .topbar{display:flex;align-items:center;gap:8px;padding:12px 22px;flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(17,17,22,.8);backdrop-filter:blur(8px);}
        .tb-toggle{width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#d0d0e0;cursor:pointer;transition:all .14s;}
        .tb-toggle:hover{background:rgba(255,255,255,0.18);color:#f0f0f5;box-shadow:0 0 14px rgba(124,106,247,.35);}
        .tb-modes{display:flex;gap:2px;background:rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:3px;}
        .tb-mode{padding:5px 14px;font-size:12px;font-weight:500;font-family:inherit;color:#9090a8;background:none;border:none;border-radius:7px;cursor:pointer;transition:all .14s;white-space:nowrap;}
        .tb-mode:hover{color:#e0e0f0;background:rgba(255,255,255,0.1);}
        .tb-mode-on{background:rgba(124,106,247,.35)!important;color:#f0f0ff!important;box-shadow:0 0 16px rgba(124,106,247,.3);}
        .tb-right{display:flex;align-items:center;gap:6px;margin-left:auto;}
        .tb-btn{display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:8px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.18);font-family:inherit;font-size:12.5px;font-weight:500;color:#d8d8e8;cursor:pointer;transition:all .15s;}
        .tb-btn:hover{background:rgba(255,255,255,0.2);color:#f0f0f5;border-color:rgba(255,255,255,0.3);box-shadow:0 0 16px rgba(124,106,247,.25);}
        .export-menu{position:absolute;right:0;top:calc(100% + 6px);background:#1a1a22;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:4px;z-index:100;min-width:175px;box-shadow:0 8px 32px rgba(0,0,0,.5);}
        .export-menu button{display:block;width:100%;text-align:left;padding:8px 14px;border-radius:7px;background:none;border:none;font-family:inherit;font-size:12.5px;color:#a0a0b0;cursor:pointer;transition:background .12s;}
        .export-menu button:hover{background:rgba(255,255,255,0.1);color:#f0f0f5;}
        .subbar{display:flex;gap:5px;padding:7px 22px;background:rgba(17,17,22,.6);border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;overflow-x:auto;}
        .sub-btn{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.08);font-family:inherit;font-size:12px;font-weight:500;color:#b0b0c8;cursor:pointer;transition:all .14s;white-space:nowrap;flex-shrink:0;}
        .sub-btn:hover{background:rgba(255,255,255,0.14);color:#f0f0f5;border-color:rgba(255,255,255,0.28);box-shadow:0 0 12px rgba(124,106,247,.2);}
        .sub-on{background:rgba(124,106,247,.3)!important;border-color:rgba(124,106,247,.6)!important;color:#f0f0ff!important;box-shadow:0 0 14px rgba(124,106,247,.3)!important;}

        /* ── content-area: the single always-mounted wrapper ─────────────── */
        /* Both welcome and chat-area live here. Only CSS changes, never React mount. */
        .content-area{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;position:relative;}

        /* WELCOME — normal flow when visible, gone from layout when hidden */
        .welcome{flex:1;display:flex;flex-direction:column;align-items:center;padding:40px 32px 20px;overflow-y:auto;transition:opacity .15s;}
        .welcome-hidden{display:none;}
        .welcome::-webkit-scrollbar{width:4px;}
        .welcome::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px;}
        .orb-wrap{position:relative;width:88px;height:88px;margin-bottom:26px;animation:orb-float 5s ease-in-out infinite;}
        .orb-blur{position:absolute;inset:-20px;border-radius:50%;background:radial-gradient(circle,rgba(150,120,255,.22),transparent 70%);filter:blur(14px);z-index:0;}
        .orb{width:88px;height:88px;border-radius:50%;position:relative;z-index:1;background:conic-gradient(from 180deg,#c084fc,#818cf8,#60a5fa,#34d399,#fbbf24,#f472b6,#c084fc);animation:orb-glow 4s ease-in-out infinite;overflow:hidden;}
        .orb::before{content:'';position:absolute;inset:3px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.35),rgba(180,140,255,.6) 40%,rgba(100,80,200,.8));}
        .welcome-h{font-size:clamp(20px,3vw,32px);font-weight:700;letter-spacing:-.025em;text-align:center;color:#f0f0f5;margin-bottom:24px;line-height:1.25;animation:fadein .4s ease both;}

        /* CHAT AREA — flex column filling content-area */
        .chat-area{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}
        .chat-area-hidden{display:none;}

        .input-card{width:100%;max-width:760px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px 16px 12px;box-shadow:0 8px 48px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.06);transition:border-color .2s,box-shadow .2s;margin-bottom:16px;}
        .input-card:focus-within{border-color:rgba(124,106,247,.45);box-shadow:0 0 0 3px rgba(124,106,247,.12),0 8px 48px rgba(0,0,0,.4);}
        .input-ta{width:100%;background:none;border:none;outline:none;font-family:inherit;font-size:15px;line-height:1.65;color:#f0f0f5;resize:none;min-height:26px;max-height:130px;margin-bottom:12px;}
        .input-ta::placeholder{color:#44445a;}
        .input-ta:disabled{opacity:.4;cursor:not-allowed;}
        .input-actions{display:flex;align-items:center;gap:7px;}
        .ia-icon{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;}
        .ia-icon:hover{background:rgba(255,255,255,0.16);}
        .ia-btn{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.16);font-family:inherit;font-size:12.5px;font-weight:500;color:#b8b8d0;cursor:pointer;transition:all .15s;}
        .ia-btn:hover{background:rgba(255,255,255,0.18);color:#f0f0f5;border-color:rgba(255,255,255,0.28);box-shadow:0 0 12px rgba(124,106,247,.2);}
        .ia-send{margin-left:auto;width:36px;height:36px;border-radius:10px;border:none;background:linear-gradient(135deg,#b8a8ff,#7ec4ff);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;box-shadow:0 0 22px rgba(180,168,255,.6),0 2px 8px rgba(0,0,0,.3);}
        .ia-send:hover:not(:disabled){transform:scale(1.07);box-shadow:0 0 32px rgba(180,168,255,.8),0 4px 12px rgba(0,0,0,.3);}
        .ia-send:disabled{opacity:.35;cursor:not-allowed;box-shadow:none;}
        .ia-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;}

        .sug-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:760px;}
        .sug-card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px 18px;cursor:pointer;transition:all .2s;animation:card-in .4s ease both;}
        .sug-card:hover{background:rgba(255,255,255,0.09);border-color:rgba(124,106,247,.35);transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.25);}
        .sug-title{font-size:14px;font-weight:600;color:#f0f0f5;margin-bottom:5px;}
        .sug-desc{font-size:12px;color:#8a8a9a;line-height:1.55;}

        .chat-scroll{flex:1;overflow-y:auto;}
        .chat-scroll::-webkit-scrollbar{width:4px;}
        .chat-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px;}
        .chat-inner{max-width:760px;margin:0 auto;padding:28px 32px 12px;}
        .chat-input-bar{padding:8px 32px 16px;max-width:760px;width:100%;margin:0 auto;flex-shrink:0;}

        .skel-wrap{padding:16px 0;}
        .skel-msg{margin-bottom:32px;}
        .skel-u{display:flex;flex-direction:column;align-items:flex-end;}
        .skel-lbl{height:11px;width:36px;border-radius:4px;background:rgba(255,255,255,0.06);margin-bottom:8px;animation:shimmer 1.5s ease-in-out infinite;}
        .skel-line{height:15px;border-radius:4px;background:rgba(255,255,255,0.06);margin-bottom:5px;animation:shimmer 1.5s ease-in-out infinite;}

        .msg-user{display:flex;justify-content:flex-end;margin-bottom:22px;animation:fadein .2s ease;}
        .msg-user-bub{max-width:68%;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:16px 16px 4px 16px;padding:13px 18px;font-size:14.5px;color:#f0f0f5;line-height:1.7;white-space:pre-wrap;word-break:break-word;}
        .msg-ai{margin-bottom:26px;animation:fadein .25s ease;}
        .msg-ai-who{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#a78bfa;margin-bottom:12px;}
        .msg-ai-dot{width:6px;height:6px;border-radius:50%;background:#7c6af7;box-shadow:0 0 8px #7c6af7;}
        .msg-ai-body{font-size:14.5px;color:#d4d4e8;line-height:1.8;}
        .msg-actions{display:flex;gap:6px;margin-top:10px;opacity:0;transition:opacity .15s;}
        .msg-ai:hover .msg-actions{opacity:1;}
        .copy-btn{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;background:none;border:1px solid rgba(255,255,255,0.08);font-family:inherit;font-size:11.5px;color:#44445a;cursor:pointer;transition:all .14s;}
        .copy-btn:hover{background:rgba(255,255,255,0.05);color:#8a8a9a;}

        .msg-ai-body .md-h1{font-size:20px;font-weight:700;color:#f0f0f5;margin:18px 0 8px;letter-spacing:-.02em;}
        .msg-ai-body .md-h2{font-size:17px;font-weight:600;color:#e0e0f0;margin:16px 0 7px;letter-spacing:-.01em;}
        .msg-ai-body .md-h3{font-size:15px;font-weight:600;color:#d0d0e8;margin:14px 0 6px;}
        .msg-ai-body .md-p{margin-bottom:12px;color:#d4d4e8;line-height:1.8;}
        .msg-ai-body .md-p:last-child{margin-bottom:0;}
        .msg-ai-body .md-strong{font-weight:600;color:#f0f0f5;}
        .msg-ai-body .md-em{font-style:italic;color:#c4b5fd;}
        .msg-ai-body .md-ul{list-style:none;padding:0;margin:8px 0 12px;}
        .msg-ai-body .md-ol{list-style:none;padding:0;margin:8px 0 12px;counter-reset:li;}
        .msg-ai-body .md-li{display:flex;gap:10px;align-items:flex-start;padding:5px 0;color:#d4d4e8;font-size:14px;line-height:1.7;border-bottom:1px solid rgba(255,255,255,0.04);}
        .msg-ai-body .md-li:last-child{border-bottom:none;}
        .msg-ai-body .md-ul .md-li::before{content:'▸';color:#7c6af7;font-size:11px;flex-shrink:0;margin-top:4px;}
        .msg-ai-body .md-ol .md-li{counter-increment:li;}
        .msg-ai-body .md-ol .md-li::before{content:counter(li);min-width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#7c6af7,#4f8ef7);color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;}
        .msg-ai-body .md-pre{background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:14px 16px;overflow-x:auto;margin:12px 0;}
        .msg-ai-body .md-code-block{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#86efac;line-height:1.8;display:block;}
        .msg-ai-body .md-code-inline{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:#c4b5fd;background:rgba(124,106,247,0.12);border-radius:4px;padding:1px 6px;}
        .msg-ai-body .md-blockquote{border-left:3px solid #7c6af7;padding:8px 16px;margin:10px 0;background:rgba(124,106,247,0.07);border-radius:0 8px 8px 0;color:#c4b5fd;font-style:italic;}
        .msg-ai-body .md-hr{border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0;}

        .typing-row{display:flex;gap:12px;animation:fadein .2s ease;}
        .typing-av{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#b8a8ff,#7ec4ff);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;box-shadow:0 0 16px rgba(180,168,255,.6);}
        .typing-dots{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px;}
        .typing-dots span{width:6px;height:6px;border-radius:50%;background:#b8a8ff;animation:blink 1.2s ease-in-out infinite;}
        .typing-dots span:nth-child(2){animation-delay:.15s;}
        .typing-dots span:nth-child(3){animation-delay:.3s;}

        .error-bar{margin:10px 0;padding:10px 14px;border-radius:9px;font-size:13px;color:#fca5a5;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.15);}

        .mob-overlay{display:none;}
        @media(max-width:768px){
          .sidebar{position:fixed;left:0;top:0;z-index:200;transform:translateX(-100%);transition:transform .22s ease;box-shadow:4px 0 32px rgba(0,0,0,.5);}
          .sidebar-off{transform:translateX(-100%)!important;}
          .mob-show{transform:translateX(0)!important;}
          .mob-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:199;}
          .chat-inner,.chat-input-bar,.welcome{padding-left:16px;padding-right:16px;}
          .sug-grid{grid-template-columns:1fr 1fr;}
          .welcome-h{font-size:20px;}
          .tb-modes{display:none;}
        }
      `}</style>
        </div>
    )
}