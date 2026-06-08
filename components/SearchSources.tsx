'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface Source {
  title: string
  url: string
  favicon: string
}

interface SearchSourcesProps {
  sources: Source[]
  isSearching?: boolean
}

export default function SearchSources({ sources, isSearching }: SearchSourcesProps) {
  const [expanded, setExpanded] = useState(false)

  if (isSearching) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        padding: '6px 10px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        width: 'fit-content',
        fontSize: 12,
        color: 'var(--text-tertiary)',
      }}>
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: 'var(--accent)',
          animation: 'pulse 1.2s ease-in-out infinite',
          flexShrink: 0,
        }} />
        Searching the web...
      </div>
    )
  }

  if (!sources || sources.length === 0) return null

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px 5px 8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          fontFamily: 'inherit',
          transition: 'border-color 120ms ease, color 120ms ease',
          marginBottom: expanded ? 8 : 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', width: sources.length >= 3 ? 36 : sources.length * 14 }}>
          {sources.slice(0, 3).map((source, i) => (
            <img key={i} src={source.favicon} alt="" width={14} height={14}
              style={{ borderRadius: 3, position: 'absolute', left: i * 10, border: '1.5px solid var(--bg-primary)', background: 'var(--bg-tertiary)' }}
              onError={e => { (e.currentTarget as HTMLElement).style.display = 'none' }}
            />
          ))}
        </div>
        <span style={{ marginLeft: sources.length >= 3 ? 4 : 0 }}>
          {sources.length} {sources.length === 1 ? 'source' : 'sources'} searched
        </span>
        {expanded ? <ChevronUp size={12} style={{ marginLeft: 2 }} /> : <ChevronDown size={12} style={{ marginLeft: 2 }} />}
      </button>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, animation: 'fadeIn 150ms ease forwards' }}>
          {sources.map((source, i) => (
            <a key={i} href={source.url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 8, textDecoration: 'none',
                transition: 'border-color 120ms ease, background 120ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-tertiary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}
            >
              <div style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={source.favicon} alt="" width={16} height={16} style={{ borderRadius: 3 }}
                  onError={e => { (e.currentTarget as HTMLElement).style.display = 'none'; (e.currentTarget as HTMLElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                  {source.title || (() => { try { return new URL(source.url).hostname } catch { return source.url } })()}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {(() => { try { return new URL(source.url).hostname.replace('www.', '') } catch { return source.url } })()}
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 3 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
