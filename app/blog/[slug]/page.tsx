'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import ReactMarkdown from 'react-markdown'

type Blog = {
    id: string
    slug: string
    title: string
    content: string
    excerpt: string
    category: string
    read_time: string
    created_at: string
    updated_at: string
    published: boolean
    user_id: string
    author: {
        name: string
        avatar_url: string | null
        bio: string | null
    } | null
}

export default function BlogPostPage() {
    const params = useParams()
    const slug = params.slug as string
    const { user } = useUser()
    const [blog, setBlog] = useState<Blog | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch(`/api/blogs/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error('Blog not found')
                return r.json()
            })
            .then(d => setBlog(d.blog))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [slug])

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this article?')) return

        try {
            const res = await fetch(`/api/blogs/${slug}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            window.location.href = '/blog'
        } catch {
            alert('Failed to delete. Please try again.')
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="post-loading">
                <div className="loading-spinner" />
            </div>
        )
    }

    if (error || !blog) {
        return (
            <div className="post-error">
                <h1>Article Not Found</h1>
                <p>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <Link href="/blog" className="back-link">
                    ← Back to Blog
                </Link>
            </div>
        )
    }

    const isOwner = user?.id === blog.user_id

    return (
        <div className="post-root">
            <header className="post-header">
                <Link href="/blog" className="back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                </Link>

                {isOwner && (
                    <div className="post-actions">
                        <Link href={`/blog/edit/${slug}`} className="edit-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </Link>
                        <button className="delete-btn" onClick={handleDelete}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                        </button>
                    </div>
                )}
            </header>

            <article className="post-article">
                <div className="post-hero">
                    <div className="post-category">{blog.category}</div>
                    <h1 className="post-title">{blog.title}</h1>
                    <div className="post-meta">
                        <div className="post-author">
                            <div className="author-avatar">
                                {blog.author?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <div className="author-name">{blog.author?.name || 'Anonymous'}</div>
                                <div className="author-date">{formatDate(blog.created_at)}</div>
                            </div>
                        </div>
                        <div className="post-info">
                            <span>{blog.read_time}</span>
                        </div>
                    </div>
                </div>

                <div className="post-content">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                            h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                            h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                            h4: ({ children }) => <h4 className="md-h4">{children}</h4>,
                            p: ({ children }) => <p className="md-p">{children}</p>,
                            strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                            em: ({ children }) => <em className="md-em">{children}</em>,
                            ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                            ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                            li: ({ children }) => <li className="md-li">{children}</li>,
                            blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                            code: ({ children, className }) => {
                                const isBlock = !!className
                                return isBlock
                                    ? <code className="md-code-block">{children}</code>
                                    : <code className="md-code-inline">{children}</code>
                            },
                            pre: ({ children }) => <pre className="md-pre">{children}</pre>,
                            hr: () => <hr className="md-hr" />,
                            a: ({ children, href }) => <a className="md-link" href={href} target="_blank" rel="noreferrer">{children}</a>,
                            table: ({ children }) => <table className="md-table">{children}</table>,
                            th: ({ children }) => <th className="md-th">{children}</th>,
                            td: ({ children }) => <td className="md-td">{children}</td>,
                        }}
                    >
                        {blog.content}
                    </ReactMarkdown>
                </div>

                <footer className="post-footer">
                    <div className="post-tags">
                        <span className="tag-label">Category:</span>
                        <span className="tag">{blog.category}</span>
                    </div>
                    <div className="post-share">
                        <button 
                            className="share-btn"
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            Copy Link
                        </button>
                    </div>
                </footer>
            </article>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
                
                .post-root {
                    min-height: 100vh;
                    background: #0c0c0f;
                    color: #f0f0f5;
                    font-family: 'Outfit', sans-serif;
                }
                
                .post-loading, .post-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    gap: 16px;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(124,106,247,0.2);
                    border-top-color: #7c6af7;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .post-error {
                    text-align: center;
                    padding: 20px;
                }
                
                .post-error h1 {
                    font-size: 32px;
                    margin: 0 0 8px;
                }
                
                .post-error p {
                    color: #8a8a9a;
                    margin: 0 0 24px;
                }
                
                .back-link {
                    color: #7c6af7;
                    text-decoration: none;
                    font-weight: 500;
                }
                
                .back-link:hover {
                    text-decoration: underline;
                }
                
                .post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 32px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    background: rgba(17,17,22,0.8);
                    backdrop-filter: blur(8px);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                
                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #8a8a9a;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.15s;
                }
                
                .back-btn:hover {
                    color: #f0f0f5;
                }
                
                .post-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .edit-btn, .delete-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                    text-decoration: none;
                }
                
                .edit-btn {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #c0c0d8;
                }
                
                .edit-btn:hover {
                    background: rgba(255,255,255,0.12);
                    color: #f0f0f5;
                }
                
                .delete-btn {
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.2);
                    color: #fca5a5;
                }
                
                .delete-btn:hover {
                    background: rgba(239,68,68,0.2);
                }
                
                .post-article {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 48px 32px 80px;
                }
                
                .post-hero {
                    margin-bottom: 48px;
                    padding-bottom: 32px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                
                .post-category {
                    display: inline-block;
                    padding: 6px 14px;
                    background: rgba(124,106,247,0.2);
                    color: #c4b5fd;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 20px;
                }
                
                .post-title {
                    font-size: 42px;
                    font-weight: 800;
                    line-height: 1.2;
                    letter-spacing: -0.03em;
                    margin: 0 0 24px;
                    background: linear-gradient(135deg, #f0f0f5 0%, #c4b5fd 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .post-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .post-author {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .author-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7c6af7, #4f8ef7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                }
                
                .author-name {
                    font-weight: 600;
                    font-size: 15px;
                }
                
                .author-date {
                    font-size: 13px;
                    color: #8a8a9a;
                }
                
                .post-info {
                    font-size: 14px;
                    color: #8a8a9a;
                }
                
                .post-content {
                    font-size: 17px;
                    line-height: 1.8;
                    color: #d4d4e8;
                }
                
                .md-h1 { font-size: 32px; font-weight: 800; margin: 40px 0 16px; color: #f0f0f5; }
                .md-h2 { font-size: 26px; font-weight: 700; margin: 32px 0 14px; color: #f0f0f5; }
                .md-h3 { font-size: 20px; font-weight: 600; margin: 24px 0 12px; color: #f0f0f5; }
                .md-h4 { font-size: 17px; font-weight: 600; margin: 20px 0 10px; color: #e0e0f0; }
                
                .md-p { margin: 16px 0; }
                
                .md-strong { font-weight: 700; color: #f0f0f5; }
                
                .md-em { font-style: italic; color: #c4b5fd; }
                
                .md-ul, .md-ol {
                    margin: 16px 0;
                    padding-left: 24px;
                }
                
                .md-li { margin: 8px 0; }
                
                .md-ul .md-li::marker { color: #7c6af7; }
                .md-ol .md-li::marker { color: #7c6af7; font-weight: 600; }
                
                .md-blockquote {
                    border-left: 3px solid #7c6af7;
                    padding: 12px 20px;
                    margin: 20px 0;
                    background: rgba(124,106,247,0.08);
                    border-radius: 0 8px 8px 0;
                    font-style: italic;
                    color: #c4b5fd;
                }
                
                .md-code-inline {
                    background: rgba(124,106,247,0.15);
                    color: #c4b5fd;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                }
                
                .md-pre {
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 16px 20px;
                    overflow-x: auto;
                    margin: 20px 0;
                }
                
                .md-code-block {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    color: #86efac;
                    line-height: 1.6;
                    display: block;
                }
                
                .md-hr {
                    border: none;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    margin: 32px 0;
                }
                
                .md-link {
                    color: #7c6af7;
                    text-decoration: none;
                }
                
                .md-link:hover {
                    text-decoration: underline;
                }
                
                .md-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                
                .md-th, .md-td {
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 10px 14px;
                    text-align: left;
                }
                
                .md-th {
                    background: rgba(255,255,255,0.03);
                    font-weight: 600;
                }
                
                .post-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 48px;
                    padding-top: 24px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                }
                
                .post-tags {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .tag-label {
                    font-size: 13px;
                    color: #6b7280;
                }
                
                .tag {
                    padding: 4px 12px;
                    background: rgba(124,106,247,0.15);
                    border-radius: 20px;
                    font-size: 12px;
                    color: #c4b5fd;
                    font-weight: 500;
                }
                
                .share-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 500;
                    color: #c0c0d8;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                
                .share-btn:hover {
                    background: rgba(255,255,255,0.12);
                    color: #f0f0f5;
                }
                
                @media (max-width: 768px) {
                    .post-header {
                        padding: 12px 16px;
                    }
                    
                    .post-article {
                        padding: 24px 16px 48px;
                    }
                    
                    .post-title {
                        font-size: 28px;
                    }
                    
                    .post-meta {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                    
                    .post-footer {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    )
}
