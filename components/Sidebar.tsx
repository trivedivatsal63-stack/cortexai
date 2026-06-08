'use client'
import { memo, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { BookOpen, Search, Shield, Plus, MessageSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Agent } from '@/agents'
import { useUsage } from '@/hooks/useUsage'

type DBSession = { id: string; title: string; created_at: string; updated_at: string }

interface SidebarProps {
  sessions: DBSession[]
  sessionsLoading: boolean
  activeId: string | null
  activeAgent: Agent
  collapsed: boolean
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onSelectAgent: (agent: Agent) => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
  onToggleCollapse: () => void
  sidebarOpen?: boolean
  onCloseMobile?: () => void
}

const AGENTS: { id: Agent; icon: React.ReactNode; label: string }[] = [
  { id: 'learning', icon: <BookOpen size={16} />, label: 'Learning' },
  { id: 'research', icon: <Search size={16} />, label: 'Research' },
  { id: 'security', icon: <Shield size={16} />, label: 'Security' },
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

export const Sidebar = memo(function Sidebar({
  sessions, sessionsLoading, activeId, activeAgent, collapsed,
  onNewChat, onSelectSession, onSelectAgent, onDeleteSession,
  onToggleCollapse,
  sidebarOpen, onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { usage, loading: usageLoading } = useUsage()
  const grouped = groupByDate(sessions)
  const isChat = pathname === '/chat'

  const used = usage?.used ?? 0
  const limit = usage?.limit ?? 100
  const percentUsed = limit > 0 ? (used / limit) * 100 : 0
  const barColor = percentUsed >= 80 ? 'var(--danger)' : 'var(--accent)'

  const sidebarContent = (
    <div className="h-full flex flex-col overflow-hidden transition-all duration-200" style={{
      width: collapsed ? 60 : 260,
      background: 'var(--bg-secondary)',
    }}>
      {/* Logo + toggle */}
      <div className={collapsed ? 'flex items-center justify-between h-14 px-3 flex-shrink-0' : 'flex items-center justify-between h-14 px-5 flex-shrink-0'}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
          {!collapsed && <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>AETHER</span>}
        </div>
        <button onClick={onToggleCollapse}
          className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors flex-shrink-0"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat */}
      {isChat && (
        <div className={collapsed ? 'px-3 pb-2 flex-shrink-0 flex justify-center' : 'px-3 pb-2 flex-shrink-0'}>
          <button onClick={onNewChat}
            className="h-9 rounded-[var(--radius-md)] text-sm font-medium transition-colors flex items-center justify-center"
            style={{
              background: 'var(--accent)', color: 'var(--accent-fg)',
              width: collapsed ? 36 : '100%',
              gap: collapsed ? 0 : 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            <Plus size={14} />
            {!collapsed && 'New Chat'}
          </button>
        </div>
      )}

      {/* Usage meter */}
      {isChat && !collapsed && (
        <div className="mx-4 mb-3 flex-shrink-0">
          {usageLoading ? (
            <div className="h-8 rounded" style={{ background: 'var(--bg-tertiary)' }} />
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Daily usage</span>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{used}/{limit}</span>
              </div>
              <div className="mt-1.5 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(percentUsed, 100)}%`, background: barColor }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Domains */}
      <div className="flex-shrink-0">
        {!collapsed && (
          <div className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
            Domains
          </div>
        )}
        <div className={collapsed ? 'flex flex-col gap-0.5 px-2 items-center' : 'flex flex-col gap-0.5 px-2'}>
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => onSelectAgent(a.id)}
              className="flex items-center gap-2 h-[34px] px-2.5 rounded-[var(--radius-sm)] text-sm transition-colors cursor-pointer"
              style={
                collapsed
                  ? { width: 36, justifyContent: 'center',
                      background: activeAgent === a.id ? 'var(--accent-subtle)' : 'transparent',
                      color: activeAgent === a.id ? 'var(--accent-subtle-text)' : 'var(--text-secondary)' }
                  : { width: '100%',
                      background: activeAgent === a.id ? 'var(--accent-subtle)' : 'transparent',
                      color: activeAgent === a.id ? 'var(--accent-subtle-text)' : 'var(--text-secondary)' }
              }
              onMouseEnter={e => { if (activeAgent !== a.id) { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
              onMouseLeave={e => { if (activeAgent !== a.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            >
              {a.icon}
              {!collapsed && a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto min-h-0 pt-2">
          <div className="px-4 pb-1 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
            Recent
          </div>
          {sessionsLoading ? (
            <div className="px-2 space-y-1">
              {[1,2,3].map(i => <div key={i} className="h-[34px] rounded-[var(--radius-sm)]" style={{ background: 'var(--bg-tertiary)' }} />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="px-4 py-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>No conversations yet</div>
          ) : (
            <div className="px-2 space-y-0.5">
              {sessions.map(s => {
                const isActive = activeId === s.id
                return (
                  <div key={s.id} onClick={() => { onSelectSession(s.id); onCloseMobile?.() }}
                    className="group flex items-center gap-2 h-[34px] px-2.5 rounded-[var(--radius-sm)] text-sm cursor-pointer transition-colors"
                    style={
                      isActive
                        ? { background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }
                        : { background: 'transparent', color: 'var(--text-secondary)' }
                    }
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                  >
                    <MessageSquare size={14} className="flex-shrink-0" />
                    <span className="flex-1 truncate text-xs">{s.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id, e) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 rounded p-0.5"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Bottom user */}
      <div className={collapsed ? 'flex flex-col items-center gap-1 px-2 py-3 border-t flex-shrink-0 mt-auto' : 'flex items-center gap-2.5 px-4 py-3 border-t flex-shrink-0 mt-auto'} style={{ borderColor: 'var(--border)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent-subtle-text)' }}>
          {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || '?'}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
              {user?.firstName || user?.fullName || 'User'}
            </span>
            <button onClick={() => router.push('/settings')}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] transition-colors flex-shrink-0"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
            >
              <Settings size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )

  return <>{sidebarContent}</>
})
