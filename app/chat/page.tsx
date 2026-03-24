'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useUsage } from '@/hooks/useUsage';
import { Sidebar } from '@/components/Sidebar';
import { ChatWindow } from '@/components/chatWindow';
import { LimitReachedModal } from '@/components/LimitReachedModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AGENTS, type Agent } from '@/agents';
import type { UsageStatus } from '@/lib/usage-tracker';
import jsPDF from 'jspdf';

type DBSession = { id: string; title: string; created_at: string; updated_at: string };
type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };

const AGENT_NAMES: Record<Agent, string> = {
    learning: 'Learning',
    research: 'Research',
    security: 'Security',
};

const AGENT_ICONS: Record<Agent, string> = {
    learning: '🧠',
    research: '🔎',
    security: '🛡️',
};

export default function ChatPage() {
    const [sessions, setSessions] = useState<DBSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeAgent, setActiveAgent] = useState<Agent>('learning');

    const activeIdRef = useRef<string | null>(null);
    const sendingRef = useRef(false);
    const creatingSessionRef = useRef(false);
    const messagesRef = useRef<Message[]>([]);
    const activeAgentRef = useRef<Agent>('learning');
    const exportRef = useRef<HTMLDivElement>(null);

    const { usage, syncUsage, isAtLimit } = useUsage();

    useEffect(() => { messagesRef.current = messages }, [messages]);
    useEffect(() => { activeIdRef.current = activeId }, [activeId]);
    useEffect(() => { activeAgentRef.current = activeAgent }, [activeAgent]);

    useEffect(() => {
        fetch('/api/sessions')
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const s = data?.sessions ?? data ?? [];
                setSessions(Array.isArray(s) ? s : []);
            })
            .catch(() => setSessions([]))
            .finally(() => setSessionsLoading(false));
    }, []);

    useEffect(() => {
        if (!showExport || !exportRef.current) return;
        const handleClick = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setShowExport(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showExport]);

    const loadMessages = useCallback((chatId: string) => {
        if (!chatId) return;
        setMessagesLoading(true);
        fetch(`/api/message/${chatId}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.messages?.length > 0) {
                    setMessages(d.messages);
                } else {
                    setMessages([]);
                }
            })
            .catch(() => setMessages([]))
            .finally(() => setMessagesLoading(false));
    }, []);

    useEffect(() => {
        if (!activeId) {
            setMessages([]);
            return;
        }
        if (sendingRef.current || creatingSessionRef.current) {
            return;
        }
        loadMessages(activeId);
    }, [activeId, loadMessages]);

    function newChat() {
        if (sendingRef.current) return;
        setError('');
        setActiveId(null);
        setMessages([]);
    }

    function switchSession(id: string) {
        if (id === activeIdRef.current) return;
        if (sendingRef.current) return;
        setError('');
        setActiveId(id);
    }

    async function deleteSession(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        const next = sessions.filter(s => s.id !== id);
        setSessions(next);
        if (activeId === id) {
            setActiveId(next[0]?.id ?? null);
            setMessages([]);
        }
        try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
        } catch {
            setError('Failed to delete');
            setSessions(sessions);
            if (activeId === id) setActiveId(id);
        }
    }

    const activeSession = sessions.find(s => s?.id === activeId);
    const chatTitle = activeSession?.title || 'New Chat';
    const safeFileName = chatTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_') || 'chat';

    function downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportMarkdown() {
        const text = messages
            .map(m => {
                const role = m.role === 'user' ? 'You' : AGENT_NAMES[activeAgent];
                return `## ${role}\n\n${m.content}`;
            })
            .join('\n\n');
        const content = `# ${chatTitle}\n\n*Exported from CortexAI - ${new Date().toLocaleString()}*\n\n---\n\n${text}`;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        downloadBlob(blob, `${safeFileName}.md`);
        setShowExport(false);
    }

    function exportText() {
        const text = messages
            .map(m => {
                const role = m.role === 'user' ? 'You' : AGENT_NAMES[activeAgent];
                return `[${role}]\n${m.content}`;
            })
            .join('\n\n');
        const content = `CortexAI Chat - ${chatTitle}\nExported: ${new Date().toLocaleString()}\n================================\n\n${text}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        downloadBlob(blob, `${safeFileName}.txt`);
        setShowExport(false);
    }

    function exportPDF() {
        const doc = new jsPDF();
        let y = 10;

        doc.setFontSize(16);
        doc.text(chatTitle, 10, y);
        y += 10;

        messages.forEach(m => {
            doc.setFontSize(12);
            const label = m.role === 'user' ? 'You:' : `${AGENT_NAMES[activeAgent]}:`;
            const lines = doc.splitTextToSize(`${label} ${m.content}`, 180);
            doc.text(lines, 10, y);
            y += lines.length * 7;
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        });

        doc.save(`${safeFileName}.pdf`);
        setShowExport(false);
    }

    function selectAgent(agent: Agent) {
        if (agent === activeAgent) return;
        setActiveAgent(agent);
        setActiveId(null);
        setMessages([]);
    }

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;
        if (sendingRef.current) return;
        sendingRef.current = true;

        const currentUsage = usage;
        if (currentUsage && !currentUsage.allowed) {
            setShowLimitModal(true);
            sendingRef.current = false;
            return;
        }

        setError('');
        setIsSending(true);

        const userMsgId = crypto.randomUUID();
        const assistantMsgId = crypto.randomUUID();
        const userTimestamp = new Date().toISOString();
        const assistantTimestamp = new Date(Date.now() + 1).toISOString();

        let chatId = activeIdRef.current;
        let isNewSession = false;

        if (!chatId) {
            try {
                creatingSessionRef.current = true;
                const res = await fetch('/api/sessions', { method: 'POST' });
                if (!res.ok) throw new Error('session');
                const data = await res.json();
                const session = data?.session ?? data;
                if (!session?.id) throw new Error('no id');
                chatId = session.id;
                isNewSession = true;
                activeIdRef.current = chatId;
                setActiveId(chatId);
                setSessions(prev => [session, ...(prev ?? [])]);
                creatingSessionRef.current = false;
            } catch {
                creatingSessionRef.current = false;
                setError('Failed to start chat. Please try again.');
                setIsSending(false);
                sendingRef.current = false;
                return;
            }
        }

        const userMsg: Message = { id: userMsgId, role: 'user', content, created_at: userTimestamp };
        const assistantPlaceholder: Message = { id: assistantMsgId, role: 'assistant', content: '', created_at: assistantTimestamp };

        setMessages(prev => [...prev, userMsg, assistantPlaceholder]);

        await Promise.allSettled([
            fetch(`/api/message/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userMsgId, role: 'user', content, created_at: userTimestamp }),
            }),
            fetch(`/api/message/${chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: assistantMsgId, role: 'assistant', content: '', created_at: assistantTimestamp }),
            }),
        ]);

        const shouldTitle = isNewSession || !activeSession?.title || activeSession?.title === 'New Chat';
        if (shouldTitle) {
            const newTitle = content.slice(0, 45) + (content.length > 45 ? '...' : '');
            setSessions(prev => prev.map(s => s.id === chatId ? { ...s, title: newTitle } : s));
            fetch(`/api/sessions/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle }),
            }).catch(() => {});
        }

        const contextMessages = [
            ...messagesRef.current.slice(-7),
            { role: 'user' as const, content }
        ];

        try {
            const aiRes = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: contextMessages,
                    agent: activeAgentRef.current,
                }),
            });
            const aiData = await aiRes.json();

            if (aiRes.status === 429 && aiData.error === 'limit_exceeded') {
                if (aiData.usage) syncUsage(aiData.usage);
                setShowLimitModal(true);
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId));
                fetch(`/api/message/${chatId}/${userMsgId}`, { method: 'DELETE' }).catch(() => {});
                fetch(`/api/message/${chatId}/${assistantMsgId}`, { method: 'DELETE' }).catch(() => {});
                setIsSending(false);
                sendingRef.current = false;
                return;
            }

            const reply: string = aiData.reply ?? '';
            if (!reply) {
                setError(aiData.error ?? 'No response. Please try again.');
                setMessages(prev => prev.filter(m => m.id !== userMsgId && m.id !== assistantMsgId));
                fetch(`/api/message/${chatId}/${userMsgId}`, { method: 'DELETE' }).catch(() => {});
                fetch(`/api/message/${chatId}/${assistantMsgId}`, { method: 'DELETE' }).catch(() => {});
                setIsSending(false);
                sendingRef.current = false;
                return;
            }

            if (aiData.usage) syncUsage(aiData.usage);

            setMessages(prev =>
                prev.map(m => m.id === assistantMsgId ? { ...m, content: reply } : m)
            );

            fetch(`/api/message/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: assistantMsgId, content: reply }),
            }).catch(() => {});

        } catch {
            setError('Network error. Check your connection.');
            setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        } finally {
            setIsSending(false);
            sendingRef.current = false;
            creatingSessionRef.current = false;
        }
    }, [usage, syncUsage, activeSession]);

    return (
        <div className="chat-layout">
            <Sidebar
                sessions={sessions}
                sessionsLoading={sessionsLoading}
                activeId={activeId}
                activeAgent={activeAgent}
                onNewChat={newChat}
                onSelectSession={switchSession}
                onDeleteSession={deleteSession}
                onSelectAgent={selectAgent}
                onOpenSettings={() => setShowSettings(true)}
                sidebarOpen={sidebarOpen}
            />

            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

            <div className="main-content">
                <header className="chat-header">
                    <div className="header-left">
                        <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(p => !p)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <span className="agent-badge">
                            <span className="agent-badge-icon">{AGENT_ICONS[activeAgent]}</span>
                            <span className="agent-badge-name">{AGENT_NAMES[activeAgent]}</span>
                        </span>
                    </div>
                    <div className="header-right">
                        {messages.length > 0 && (
                            <div className="export-container" ref={exportRef}>
                                <button className="export-btn" onClick={(e) => { e.stopPropagation(); setShowExport(p => !p); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Export
                                </button>
                                {showExport && (
                                    <div className="export-dropdown">
                                        <button className="export-option" onClick={(e) => { e.stopPropagation(); exportPDF(); }}>Export as PDF</button>
                                        <button className="export-option" onClick={(e) => { e.stopPropagation(); exportMarkdown(); }}>Export as MD</button>
                                        <button className="export-option" onClick={(e) => { e.stopPropagation(); exportText(); }}>Export as TXT</button>
                                    </div>
                                )}
                            </div>
                        )}
                        {usage && (
                            <div className="usage-indicator">
                                <span className={`usage-dot ${usage.percentUsed >= 90 ? 'critical' : usage.percentUsed >= 75 ? 'warning' : 'ok'}`} />
                                <span className="usage-text">{usage.used}/{usage.limit}</span>
                            </div>
                        )}
                    </div>
                </header>

                <ChatWindow
                    messages={messages}
                    messagesLoading={messagesLoading}
                    isSending={isSending}
                    isAtLimit={isAtLimit}
                    agent={activeAgent}
                    error={error}
                    onSendMessage={sendMessage}
                />
            </div>

            {showLimitModal && usage && (
                <LimitReachedModal usage={usage} onDismiss={() => setShowLimitModal(false)} />
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

                *, *::before, *::after {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                html, body {
                    height: 100%;
                    overflow: hidden;
                }

                :root {
                    --bg-primary: #0c0c0f;
                    --bg-secondary: #111116;
                    --bg-elevated: rgba(255, 255, 255, 0.03);
                    --border: rgba(255, 255, 255, 0.06);
                    --border-hover: rgba(255, 255, 255, 0.1);
                    --text-primary: #f0f0f5;
                    --text-secondary: #8a8a9a;
                    --text-muted: #44445a;
                    --accent: #7c6af7;
                    --accent-glow: rgba(124, 106, 247, 0.4);
                    --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
                    --font-mono: 'JetBrains Mono', monospace;
                }

                @keyframes fadein {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes blink {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .chat-layout {
                    display: flex;
                    width: 100vw;
                    height: 100dvh;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-family: var(--font-sans);
                }

                /* Sidebar */
                .sidebar {
                    width: 260px;
                    min-width: 260px;
                    height: 100%;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    transition: width 0.2s ease, min-width 0.2s ease;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .sidebar-closed {
                    width: 0 !important;
                    min-width: 0 !important;
                }

                .sidebar-header {
                    display: flex;
                    align-items: center;
                    padding: 14px 16px 8px;
                    flex-shrink: 0;
                }

                .sidebar-icon {
                    border-radius: 50%;
                }

                .toggle-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }

                .toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-primary);
                }

                .new-chat-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin: 8px 14px 12px;
                    padding: 10px 16px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #7c6af7, #5b6ef7);
                    border: none;
                    color: white;
                    font-family: var(--font-sans);
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    box-shadow: 0 2px 12px rgba(124, 106, 247, 0.35);
                }

                .new-chat-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(124, 106, 247, 0.5);
                }

                .chat-history {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 10px;
                    min-height: 0;
                }

                .chat-history::-webkit-scrollbar {
                    width: 3px;
                }

                .chat-history::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 2px;
                }

                .section-label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    padding: 8px 8px 6px;
                }

                .group-label {
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--text-muted);
                    padding: 10px 8px 4px;
                }

                .empty-state {
                    font-size: 12.5px;
                    color: var(--text-muted);
                    padding: 12px 8px;
                }

                .skeleton-list {
                    padding: 4px 8px;
                }

                .skeleton-item {
                    height: 24px;
                    border-radius: 8px;
                    background: var(--bg-elevated);
                    margin-bottom: 6px;
                    animation: blink 1.5s ease-in-out infinite;
                }

                .chat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.12s ease;
                    margin-bottom: 2px;
                }

                .chat-item:hover {
                    background: var(--bg-elevated);
                }

                .chat-item.active {
                    background: rgba(124, 106, 247, 0.12);
                }

                .chat-item-text {
                    flex: 1;
                    font-size: 12.5px;
                    color: var(--text-secondary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .chat-item.active .chat-item-text {
                    color: var(--text-primary);
                }

                .chat-item-delete {
                    opacity: 0;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.12s ease;
                }

                .chat-item:hover .chat-item-delete {
                    opacity: 1;
                }

                .chat-item-delete:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .divider {
                    height: 1px;
                    background: var(--border);
                    margin: 8px 14px;
                    flex-shrink: 0;
                }

                .agents-section {
                    padding: 0 10px 8px;
                    flex-shrink: 0;
                }

                .agent-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    margin-bottom: 2px;
                }

                .agent-item:hover {
                    background: var(--bg-elevated);
                }

                .agent-item.active {
                    background: rgba(124, 106, 247, 0.15);
                    box-shadow: inset 0 0 0 1px rgba(124, 106, 247, 0.3);
                }

                .agent-icon {
                    font-size: 16px;
                    width: 24px;
                    text-align: center;
                }

                .agent-name {
                    font-size: 13.5px;
                    font-weight: 500;
                    color: var(--text-secondary);
                }

                .agent-item.active .agent-name {
                    color: var(--text-primary);
                }

                .sidebar-bottom {
                    padding: 8px 10px 12px;
                    margin-top: auto;
                    border-top: 1px solid var(--border);
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sidebar-bottom-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-align: left;
                    width: 100%;
                }

                .sidebar-bottom-btn:hover {
                    background: var(--bg-elevated);
                    color: var(--text-secondary);
                }

                .sidebar-bottom-btn.sign-out-btn {
                    color: var(--text-muted);
                }

                .sidebar-bottom-btn.sign-out-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                /* Main Content */
                .main-content {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--border);
                    background: rgba(17, 17, 22, 0.6);
                    backdrop-filter: blur(8px);
                    flex-shrink: 0;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .toggle-sidebar-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }

                .toggle-sidebar-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-primary);
                    border-color: var(--border-hover);
                }

                .agent-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: rgba(124, 106, 247, 0.12);
                    border: 1px solid rgba(124, 106, 247, 0.25);
                }

                .agent-badge-icon {
                    font-size: 14px;
                }

                .agent-badge-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .usage-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--text-muted);
                }

                .export-container {
                    position: relative;
                }

                .export-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-family: var(--font-sans);
                    font-size: 12.5px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .export-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-primary);
                    border-color: var(--border-hover);
                }

                .export-dropdown {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 8px);
                    background: #1a1a22;
                    border: 1px solid rgba(124, 106, 247, 0.3);
                    border-radius: 12px;
                    padding: 6px;
                    z-index: 1000;
                    min-width: 180px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 106, 247, 0.15);
                    animation: fadein 0.15s ease;
                }

                .export-option {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 8px;
                    background: transparent;
                    border: none;
                    font-family: var(--font-sans);
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-align: left;
                }

                .export-option:hover {
                    background: linear-gradient(135deg, rgba(124, 106, 247, 0.2), rgba(79, 142, 247, 0.1));
                    color: #f0f0f5;
                    transform: translateX(4px);
                    box-shadow: 0 0 12px rgba(124, 106, 247, 0.2);
                }

                .usage-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #10b981;
                }

                .usage-dot.warning {
                    background: #f59e0b;
                }

                .usage-dot.critical {
                    background: #ef4444;
                }

                /* Chat Window */
                .chat-window {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                }

                .chat-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 0;
                    min-height: 0;
                }

                .chat-scroll::-webkit-scrollbar {
                    width: 4px;
                }

                .chat-scroll::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 2px;
                }

                .loading-skeleton {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .skeleton-msg {
                    margin-bottom: 24px;
                    animation: fadein 0.3s ease;
                }

                .skeleton-ai {
                    display: flex;
                    gap: 12px;
                }

                .skeleton-user {
                    display: flex;
                    justify-content: flex-end;
                }

                .skeleton-line {
                    height: 16px;
                    border-radius: 6px;
                    background: var(--bg-elevated);
                    animation: blink 1.5s ease-in-out infinite;
                }

                .scroll-end {
                    height: 1px;
                }

                /* Messages */
                .message {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 0 20px;
                    animation: fadein 0.2s ease;
                }

                .user-message {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 16px;
                }

                .user-bubble {
                    max-width: 75%;
                    background: rgba(124, 106, 247, 0.15);
                    border: 1px solid rgba(124, 106, 247, 0.2);
                    border-radius: 16px 16px 4px 16px;
                    padding: 12px 16px;
                    font-size: 14.5px;
                    line-height: 1.6;
                    color: var(--text-primary);
                    word-break: break-word;
                }

                .assistant-message {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .message-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, #7c6af7, #4f8ef7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    box-shadow: 0 0 16px var(--accent-glow);
                }

                .message-content {
                    flex: 1;
                    min-width: 0;
                }

                .ai-prose {
                    font-size: 14.5px;
                    line-height: 1.75;
                    color: var(--text-secondary);
                }

                .ai-prose .ai-h1 {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 20px 0 12px;
                    letter-spacing: -0.02em;
                }

                .ai-prose .ai-h2 {
                    font-size: 17px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 18px 0 10px;
                }

                .ai-prose .ai-h3 {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 14px 0 8px;
                }

                .ai-prose .ai-p {
                    margin-bottom: 12px;
                }

                .ai-prose .ai-strong {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .ai-prose .ai-em {
                    font-style: italic;
                    color: #c4b5fd;
                }

                .ai-prose .ai-ul, .ai-prose .ai-ol {
                    margin: 8px 0 12px;
                    padding-left: 0;
                    list-style: none;
                }

                .ai-prose .ai-li {
                    position: relative;
                    padding: 4px 0 4px 20px;
                    color: var(--text-secondary);
                }

                .ai-prose .ai-ul .ai-li::before {
                    content: '▸';
                    position: absolute;
                    left: 0;
                    color: var(--accent);
                    font-size: 12px;
                }

                .ai-prose .ai-ol {
                    counter-reset: li;
                }

                .ai-prose .ai-ol .ai-li {
                    counter-increment: li;
                }

                .ai-prose .ai-ol .ai-li::before {
                    content: counter(li);
                    position: absolute;
                    left: 0;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--accent), #4f8ef7);
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ai-prose .ai-pre {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 14px 16px;
                    overflow-x: auto;
                    margin: 12px 0;
                }

                .ai-prose .ai-code-block {
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    color: #86efac;
                    line-height: 1.7;
                    display: block;
                }

                .ai-prose .ai-code-inline {
                    font-family: var(--font-mono);
                    font-size: 12.5px;
                    color: #c4b5fd;
                    background: rgba(124, 106, 247, 0.12);
                    border-radius: 4px;
                    padding: 2px 6px;
                }

                .ai-prose .ai-blockquote {
                    border-left: 3px solid var(--accent);
                    padding: 8px 16px;
                    margin: 12px 0;
                    background: rgba(124, 106, 247, 0.07);
                    border-radius: 0 8px 8px 0;
                    color: #c4b5fd;
                    font-style: italic;
                }

                .ai-prose .ai-hr {
                    border: none;
                    border-top: 1px solid var(--border);
                    margin: 16px 0;
                }

                .ai-prose .ai-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                    font-size: 13px;
                }

                .ai-prose .ai-thead {
                    background: var(--bg-elevated);
                }

                .ai-prose .ai-th {
                    padding: 10px 12px;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }

                .ai-prose .ai-td {
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                }

                .ai-prose .ai-tr:hover .ai-td {
                    background: var(--bg-elevated);
                }

                .message-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                }

                .message-content:hover .message-actions {
                    opacity: 1;
                }

                .copy-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 10px;
                    border-radius: 6px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    font-family: var(--font-sans);
                    font-size: 11.5px;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.14s ease;
                }

                .copy-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: var(--text-secondary);
                    border-color: var(--border-hover);
                }

                .typing-indicator {
                    display: flex;
                    gap: 5px;
                    padding: 4px 0;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--accent);
                    animation: blink 1.2s ease-in-out infinite;
                }

                .typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .typing-dot:nth-child(3) { animation-delay: 0.3s; }

                .error-message {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    max-width: 720px;
                    margin: 12px auto;
                    padding: 12px 16px;
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 10px;
                    font-size: 13px;
                    color: #fca5a5;
                }

                /* Welcome Screen */
                .welcome-screen {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    pointer-events: none;
                }

                .welcome-content {
                    text-align: center;
                    animation: fadein 0.5s ease;
                }

                .welcome-icon-wrapper {
                    margin-bottom: 16px;
                    animation: welcomeFloat 3s ease-in-out infinite;
                }

                .welcome-icon {
                    border-radius: 50%;
                }

                @keyframes welcomeFloat {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.9;
                    }
                    50% {
                        transform: scale(1.04);
                        opacity: 1;
                    }
                }

                .welcome-title {
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text-primary);
                    letter-spacing: -0.02em;
                }

                /* Input Area */
                .chat-input-area {
                    padding: 12px 20px 20px;
                    background: linear-gradient(to top, var(--bg-primary) 80%, transparent);
                    flex-shrink: 0;
                }

                .input-bar-container {
                    max-width: 720px;
                    margin: 0 auto;
                }

                .input-bar {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    padding: 10px 12px;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
                }

                .input-bar:focus-within {
                    border-color: rgba(124, 106, 247, 0.4);
                    box-shadow: 0 0 0 3px rgba(124, 106, 247, 0.1), 0 4px 24px rgba(0, 0, 0, 0.3);
                }

                .input-bar.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .input-textarea {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    font-family: var(--font-sans);
                    font-size: 14.5px;
                    line-height: 1.6;
                    color: var(--text-primary);
                    resize: none;
                    min-height: 24px;
                    max-height: 150px;
                    padding: 2px 0;
                }

                .input-textarea::placeholder {
                    color: var(--text-muted);
                }

                .input-textarea:disabled {
                    cursor: not-allowed;
                }

                .send-btn {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    border: none;
                    background: var(--bg-elevated);
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    flex-shrink: 0;
                }

                .send-btn.active {
                    background: linear-gradient(135deg, #7c6af7, #5b6ef7);
                    color: white;
                    box-shadow: 0 2px 12px var(--accent-glow);
                }

                .send-btn.active:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 20px var(--accent-glow);
                }

                .send-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .send-btn:disabled.active {
                    transform: none;
                    box-shadow: none;
                }

                .send-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }

                .input-hint {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 8px;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .hint-sep {
                    opacity: 0.5;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .sidebar {
                        position: fixed;
                        left: 0;
                        top: 0;
                        z-index: 200;
                        transform: translateX(-100%);
                        transition: transform 0.22s ease;
                        box-shadow: 4px 0 32px rgba(0, 0, 0, 0.5);
                    }

                    .sidebar:not(.sidebar-closed) {
                        transform: translateX(0);
                    }

                    .chat-header {
                        padding: 10px 16px;
                    }

                    .message {
                        padding: 0 16px;
                    }

                    .chat-input-area {
                        padding: 10px 16px 16px;
                    }

                    .welcome-title {
                        font-size: 22px;
                    }

                    .welcome-prompts {
                        gap: 6px;
                    }

                    .prompt-card {
                        padding: 12px 14px;
                    }
                }
            `}</style>
        </div>
    );
}
