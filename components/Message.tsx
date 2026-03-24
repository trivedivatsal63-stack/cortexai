'use client';
import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };

interface MessageItemProps {
    msg: Message;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    return (
        <button
            className="copy-btn"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }}
        >
            {copied ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
            )}
        </button>
    );
}

function TypingIndicator() {
    return (
        <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
        </div>
    );
}

export const MessageItem = memo(function MessageItem({ msg }: MessageItemProps) {
    const isUser = msg.role === 'user';
    const isEmpty = msg.content === '';

    if (isUser) {
        return (
            <div className="message user-message">
                <div className="message-bubble user-bubble">
                    {msg.content}
                </div>
            </div>
        );
    }

    return (
        <div className="message assistant-message">
            <div className="message-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            </div>
            <div className="message-content">
                {isEmpty ? (
                    <TypingIndicator />
                ) : (
                    <>
                        <div className="ai-prose">
                            <ReactMarkdown
                                components={{
                                    h1: ({ children }) => <h1 className="ai-h1">{children}</h1>,
                                    h2: ({ children }) => <h2 className="ai-h2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="ai-h3">{children}</h3>,
                                    p: ({ children }) => <p className="ai-p">{children}</p>,
                                    strong: ({ children }) => <strong className="ai-strong">{children}</strong>,
                                    em: ({ children }) => <em className="ai-em">{children}</em>,
                                    ul: ({ children }) => <ul className="ai-ul">{children}</ul>,
                                    ol: ({ children }) => <ol className="ai-ol">{children}</ol>,
                                    li: ({ children }) => <li className="ai-li">{children}</li>,
                                    pre: ({ children }) => <pre className="ai-pre">{children}</pre>,
                                    code: ({ children, className }) => {
                                        const isBlock = !!className;
                                        return isBlock ? (
                                            <code className="ai-code-block">{children}</code>
                                        ) : (
                                            <code className="ai-code-inline">{children}</code>
                                        );
                                    },
                                    blockquote: ({ children }) => <blockquote className="ai-blockquote">{children}</blockquote>,
                                    hr: () => <hr className="ai-hr" />,
                                    table: ({ children }) => <table className="ai-table">{children}</table>,
                                    thead: ({ children }) => <thead className="ai-thead">{children}</thead>,
                                    tbody: ({ children }) => <tbody>{children}</tbody>,
                                    tr: ({ children }) => <tr className="ai-tr">{children}</tr>,
                                    th: ({ children }) => <th className="ai-th">{children}</th>,
                                    td: ({ children }) => <td className="ai-td">{children}</td>,
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                        <div className="message-actions">
                            <CopyButton text={msg.content} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.msg.id === next.msg.id && prev.msg.content === next.msg.content;
});
