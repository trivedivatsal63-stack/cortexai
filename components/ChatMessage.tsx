'use client'

import { MermaidDiagram } from './MermaidDiagram'

function parseMessageContent(content: string) {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
    const parts: Array<{ type: 'text' | 'diagram'; content: string }> = []
    let lastIndex = 0
    let match

    while ((match = mermaidRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
        }
        parts.push({ type: 'diagram', content: match[1].trim() })
        lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
        parts.push({ type: 'text', content: content.slice(lastIndex) })
    }

    return parts
}

function StructuredText({ content }: { content: string }) {
    return (
        <div style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(232,234,240,0.85)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {content.split('\n').map((line, i) => {
                // Bold: **text**
                const parts = line.split(/(\*\*.*?\*\*)/g)
                return (
                    <div key={i} style={{ minHeight: line === '' ? 8 : undefined }}>
                        {parts.map((part, j) =>
                            part.startsWith('**') && part.endsWith('**')
                                ? <strong key={j} style={{ color: '#E8EAF0', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
                                : <span key={j}>{part}</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export function ChatMessage({ role, content }: { role: string; content: string }) {
    const parts = parseMessageContent(content)

    return (
        <div style={{
            display: 'flex',
            justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16,
        }}>
            <div style={{
                maxWidth: '80%',
                background: role === 'user'
                    ? 'rgba(0,255,178,0.08)'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${role === 'user' ? 'rgba(0,255,178,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                padding: '12px 16px',
            }}>
                {parts.map((part, i) =>
                    part.type === 'diagram'
                        ? <MermaidDiagram key={i} code={part.content} />
                        : <StructuredText key={i} content={part.content} />
                )}
            </div>
        </div>
    )
}