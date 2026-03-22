'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

function CopyBtn({ text }: { text: string }) {
    const [ok, setOk] = useState(false)
    return (
        <button className="copy-btn" onClick={() => {
            navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 2000) })
        }}>
            {ok
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Copied</>
                : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy</>
            }
        </button>
    )
}

export function AIMessage({ content }: { content: string }) {
    return (
        <div className="msg-ai">
            <div className="msg-ai-who">
                <div className="msg-ai-dot" />
                CyberAI
            </div>
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
                            const isBlock = !!className
                            return isBlock
                                ? <code className="ai-code-block">{children}</code>
                                : <code className="ai-code-inline">{children}</code>
                        },
                        blockquote: ({ children }) => <blockquote className="ai-bq">{children}</blockquote>,
                        hr: () => <hr className="ai-hr" />,
                        a: ({ children, href }) => <a className="ai-a" href={href} target="_blank" rel="noreferrer">{children}</a>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            <div className="msg-actions">
                <CopyBtn text={content} />
            </div>
        </div>
    )
}