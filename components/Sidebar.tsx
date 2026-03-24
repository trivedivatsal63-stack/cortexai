'use client';
import { memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Agent } from '@/agents';

type DBSession = { id: string; title: string; created_at: string; updated_at: string };

interface SidebarProps {
    sessions: DBSession[];
    sessionsLoading: boolean;
    activeId: string | null;
    activeAgent: Agent;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string, e?: React.MouseEvent) => void;
    onSelectAgent: (agent: Agent) => void;
    onOpenSettings: () => void;
    sidebarOpen: boolean;
}

function groupByDate(sessions: DBSession[]) {
    const now = Date.now();
    const today: DBSession[] = [], week: DBSession[] = [], older: DBSession[] = [];
    for (const s of sessions ?? []) {
        if (!s?.updated_at) continue;
        const diff = now - new Date(s.updated_at).getTime();
        if (diff < 86_400_000) today.push(s);
        else if (diff < 604_800_000) week.push(s);
        else older.push(s);
    }
    return { today, week, older };
}

const AGENTS: { id: Agent; icon: string; name: string }[] = [
    { id: 'learning', icon: '🧠', name: 'Learning' },
    { id: 'research', icon: '🔎', name: 'Research' },
    { id: 'security', icon: '🛡️', name: 'Security' },
];

export const Sidebar = memo(function Sidebar({
    sessions,
    sessionsLoading,
    activeId,
    activeAgent,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    onSelectAgent,
    onOpenSettings,
    sidebarOpen,
}: SidebarProps) {
    const router = useRouter();
    const grouped = groupByDate(sessions);

    return (
        <aside className={`sidebar ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
            <div className="sidebar-header">
                <Image src="/cortex-icon.png" alt="CortexAI" width={20} height={20} className="sidebar-icon" priority />
            </div>

            <button className="new-chat-btn" onClick={onNewChat}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Chat
            </button>

            <div className="chat-history">
                <div className="section-label">History</div>
                {sessionsLoading && (
                    <div className="skeleton-list">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-item" />)}
                    </div>
                )}
                {!sessionsLoading && sessions.length === 0 && (
                    <div className="empty-state">No conversations yet</div>
                )}
                {!sessionsLoading && grouped.today.length > 0 && (
                    <>
                        <div className="group-label">Today</div>
                        {grouped.today.map(s => (
                            <div
                                key={s.id}
                                className={`chat-item ${activeId === s.id ? 'active' : ''}`}
                                onClick={() => onSelectSession(s.id)}
                            >
                                <span className="chat-item-text">{s.title}</span>
                                <button
                                    className="chat-item-delete"
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}
                {!sessionsLoading && grouped.week.length > 0 && (
                    <>
                        <div className="group-label">This Week</div>
                        {grouped.week.map(s => (
                            <div
                                key={s.id}
                                className={`chat-item ${activeId === s.id ? 'active' : ''}`}
                                onClick={() => onSelectSession(s.id)}
                            >
                                <span className="chat-item-text">{s.title}</span>
                                <button
                                    className="chat-item-delete"
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}
                {!sessionsLoading && grouped.older.length > 0 && (
                    <>
                        <div className="group-label">Older</div>
                        {grouped.older.map(s => (
                            <div
                                key={s.id}
                                className={`chat-item ${activeId === s.id ? 'active' : ''}`}
                                onClick={() => onSelectSession(s.id)}
                            >
                                <span className="chat-item-text">{s.title}</span>
                                <button
                                    className="chat-item-delete"
                                    onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                                >
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <div className="sidebar-bottom">
                <button className="sidebar-bottom-btn" onClick={() => router.push('/premium')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Upgrade to Premium
                </button>

                <button className="sidebar-bottom-btn icon-only" onClick={onOpenSettings} title="Settings">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>
        </aside>
    );
});
