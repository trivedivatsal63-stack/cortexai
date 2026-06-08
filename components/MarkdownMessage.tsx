'use client';
import { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
      style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', fontFamily: 'inherit' }}>
      {copied ? <span style={{ color: 'var(--success)' }}>Copied</span> : <><Copy size={14} /> Copy</>}
    </button>
  );
}

const codeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: 0,
    borderRadius: 0,
    fontSize: '13px',
    background: 'transparent',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontSize: '13px',
    fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
  },
};

export const MarkdownMessage = memo(function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="min-w-0" style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)' }}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 style={{ fontSize: 20, fontWeight: 500, marginTop: 24, marginBottom: 8, lineHeight: 1.3 }} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ fontSize: 17, fontWeight: 500, marginTop: 20, marginBottom: 6, lineHeight: 1.3 }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ fontSize: 15, fontWeight: 500, marginTop: 16, marginBottom: 4 }} {...props} />,
          p: ({ node, ...props }) => <p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 12, marginTop: 0 }} {...props} />,
          strong: ({ node, ...props }) => <strong style={{ fontWeight: 500 }} {...props} />,
          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ paddingLeft: 20, marginBottom: 12, lineHeight: 1.8 }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ paddingLeft: 20, marginBottom: 12, lineHeight: 1.8 }} {...props} />,
          li: ({ node, ...props }) => <li style={{ marginBottom: 4, fontSize: 15 }} {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote style={{ borderLeft: '3px solid var(--border)', paddingLeft: 16, color: 'var(--text-secondary)', margin: '0 0 12px' }} {...props} />
          ),
          hr: ({ node, ...props }) => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} {...props} />,
          a: ({ node, ...props }) => <a style={{ color: 'var(--accent)', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer" {...props} />,
          table: ({ node, ...props }) => (
            <div style={{ overflowX: 'auto', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 12px', fontWeight: 500, textAlign: 'left' }} {...props} />
          ),
          td: ({ node, ...props }) => (
            <td style={{ border: 'none', borderBottom: '1px solid var(--border)', padding: '8px 12px' }} {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = !!className;
            const codeString = String(children).replace(/\n$/, '');

            if (isBlock) {
              return (
                <div style={{ position: 'relative', marginBottom: 16, borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{match?.[1] || 'code'}</span>
                    <CopyBtn text={codeString} />
                  </div>
                  <pre style={{ margin: 0, background: 'var(--bg-secondary)', padding: 16, overflowX: 'auto', fontSize: 13, lineHeight: 1.6 }}>
                    <SyntaxHighlighter
                      style={codeTheme as any}
                      language={match?.[1] || 'text'}
                      PreTag="div"
                      customStyle={{ margin: 0, borderRadius: 0, background: 'transparent' }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </pre>
                </div>
              );
            }

            return (
              <code style={{ fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: 4, color: 'var(--text-primary)' }} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => <>{props.children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
