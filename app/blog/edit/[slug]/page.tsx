'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

const CATEGORIES = [
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'networking', label: 'Networking' },
    { value: 'programming', label: 'Programming' },
    { value: 'os', label: 'Operating Systems' },
    { value: 'general', label: 'General' },
    { value: 'tutorials', label: 'Tutorials' },
]

type Blog = {
    id: string
    slug: string
    title: string
    content: string
    excerpt: string
    category: string
    published: boolean
    user_id: string
}

export default function EditBlogPage() {
    const router = useRouter()
    const params = useParams()
    const slug = params.slug as string
    const { user, isLoaded } = useUser()
    
    const [, setBlog] = useState<Blog | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [category, setCategory] = useState('general')
    const [published, setPublished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        if (!isLoaded) return
        
        fetch(`/api/blogs/${slug}`)
            .then(r => r.json())
            .then(d => {
                const b = d.blog
                if (!b || b.user_id !== user?.id) {
                    router.push('/blog')
                    return
                }
                setBlog(b)
                setTitle(b.title)
                setContent(b.content)
                setExcerpt(b.excerpt || '')
                setCategory(b.category)
                setPublished(b.published)
            })
            .catch(() => router.push('/blog'))
            .finally(() => setLoading(false))
    }, [isLoaded, slug, user, router])

    async function handleSave(updatePublished: boolean) {
        if (!title.trim() || !content.trim()) {
            alert('Title and content are required')
            return
        }

        setSaving(true)

        try {
            const res = await fetch(`/api/blogs/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    content,
                    excerpt: excerpt || content.slice(0, 150) + '...',
                    category,
                    published: updatePublished,
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            const { blog: updatedBlog } = await res.json()
            router.push(`/blog/${updatedBlog.slug}`)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    function insertMarkdown(before: string, after: string = '') {
        const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = content.substring(start, end)
        const newContent = content.substring(0, start) + before + selected + after + content.substring(end)
        setContent(newContent)

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
        }, 0)
    }

    if (loading || !isLoaded) {
        return (
            <div className="editor-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="editor-root">
            <header className="editor-header">
                <Link href={`/blog/${slug}`} className="back-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Article
                </Link>

                <div className="editor-actions">
                    <span className="draft-status">
                        {published ? 'Published' : 'Draft'}
                    </span>
                    <button 
                        className="preview-btn"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button 
                        className="draft-btn"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                    >
                        Save Draft
                    </button>
                    <button 
                        className="publish-btn"
                        onClick={() => handleSave(true)}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : (published ? 'Update' : 'Publish')}
                    </button>
                </div>
            </header>

            <div className="editor-layout">
                <main className="editor-main">
                    {showPreview ? (
                        <div className="preview-container">
                            <h1 className="preview-title">{title || 'Untitled'}</h1>
                            <div className="preview-meta">
                                <span className="preview-category">{category}</span>
                                <span>•</span>
                                <span>{user?.fullName || user?.username}</span>
                            </div>
                            <article className="preview-content">
                                <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
                            </article>
                        </div>
                    ) : (
                        <div className="editor-container">
                            <input
                                type="text"
                                className="title-input"
                                placeholder="Article title..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            
                            <div className="editor-toolbar">
                                <button onClick={() => insertMarkdown('**', '**')} title="Bold">
                                    <strong>B</strong>
                                </button>
                                <button onClick={() => insertMarkdown('*', '*')} title="Italic">
                                    <em>I</em>
                                </button>
                                <button onClick={() => insertMarkdown('# ')} title="Heading">
                                    H
                                </button>
                                <button onClick={() => insertMarkdown('\n- ')} title="List">
                                    •
                                </button>
                                <button onClick={() => insertMarkdown('\n```\n', '\n```\n')} title="Code">
                                    {'</>'}
                                </button>
                                <button onClick={() => insertMarkdown('[', '](url)')} title="Link">
                                    🔗
                                </button>
                                <button onClick={() => insertMarkdown('\n> ')} title="Quote">
                                    &quot;
                                </button>
                            </div>

                            <textarea
                                className="editor-textarea"
                                placeholder="Write your article in Markdown..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                            />
                        </div>
                    )}
                </main>

                <aside className="editor-sidebar">
                    <div className="sidebar-section">
                        <label className="sidebar-label">Status</label>
                        <div className="status-badge" data-published={published}>
                            {published ? 'Published' : 'Draft'}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Category</label>
                        <select 
                            className="sidebar-select"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sidebar-section">
                        <label className="sidebar-label">Excerpt</label>
                        <textarea
                            className="sidebar-textarea"
                            placeholder="Brief description (optional)"
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            rows={3}
                        />
                        <span className="sidebar-hint">A short summary shown in the article list</span>
                    </div>
                </aside>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                
                .editor-root {
                    min-height: 100vh;
                    background: #0c0c0f;
                    color: #f0f0f5;
                    font-family: 'Outfit', sans-serif;
                }
                
                .editor-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    gap: 16px;
                    color: #8a8a9a;
                }
                
                .loading-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(124,106,247,0.2);
                    border-top-color: #7c6af7;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .editor-header {
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
                
                .editor-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .draft-status {
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .preview-btn, .draft-btn, .publish-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                
                .preview-btn {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #c0c0d8;
                }
                
                .preview-btn:hover {
                    background: rgba(255,255,255,0.12);
                    color: #f0f0f5;
                }
                
                .draft-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #8a8a9a;
                }
                
                .draft-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #f0f0f5;
                }
                
                .publish-btn {
                    background: linear-gradient(135deg, #7c6af7 0%, #4f8ef7 100%);
                    border: none;
                    color: #fff;
                    box-shadow: 0 2px 12px rgba(124,106,247,0.3);
                }
                
                .publish-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 20px rgba(124,106,247,0.4);
                }
                
                .publish-btn:disabled, .draft-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .editor-layout {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 0;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .editor-main {
                    border-right: 1px solid rgba(255,255,255,0.06);
                    min-height: calc(100vh - 65px);
                }
                
                .editor-container {
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .title-input {
                    width: 100%;
                    background: none;
                    border: none;
                    outline: none;
                    font-family: inherit;
                    font-size: 36px;
                    font-weight: 800;
                    color: #f0f0f5;
                    margin-bottom: 24px;
                    letter-spacing: -0.02em;
                }
                
                .title-input::placeholder {
                    color: #44445a;
                }
                
                .editor-toolbar {
                    display: flex;
                    gap: 4px;
                    padding: 8px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                
                .editor-toolbar button {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: none;
                    border-radius: 4px;
                    color: #8a8a9a;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.1s;
                }
                
                .editor-toolbar button:hover {
                    background: rgba(255,255,255,0.08);
                    color: #f0f0f5;
                }
                
                .editor-textarea {
                    width: 100%;
                    min-height: 500px;
                    background: none;
                    border: none;
                    outline: none;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 14px;
                    line-height: 1.8;
                    color: #d4d4e8;
                    resize: none;
                }
                
                .editor-textarea::placeholder {
                    color: #44445a;
                }
                
                .preview-container {
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .preview-title {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0 0 16px;
                    letter-spacing: -0.02em;
                }
                
                .preview-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #8a8a9a;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                
                .preview-category {
                    background: rgba(124,106,247,0.2);
                    color: #c4b5fd;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .preview-content {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #d4d4e8;
                }
                
                .editor-sidebar {
                    padding: 24px;
                    background: rgba(17,17,22,0.5);
                }
                
                .sidebar-section {
                    margin-bottom: 24px;
                }
                
                .sidebar-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #8a8a9a;
                    margin-bottom: 8px;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.05);
                    color: #8a8a9a;
                }
                
                .status-badge[data-published="true"] {
                    background: rgba(16,185,129,0.15);
                    color: #34d399;
                }
                
                .sidebar-select, .sidebar-textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 10px 12px;
                    font-family: inherit;
                    font-size: 14px;
                    color: #f0f0f5;
                    outline: none;
                    transition: border-color 0.15s;
                }
                
                .sidebar-select:focus, .sidebar-textarea:focus {
                    border-color: rgba(124,106,247,0.4);
                }
                
                .sidebar-textarea {
                    resize: none;
                    line-height: 1.5;
                }
                
                .sidebar-hint {
                    display: block;
                    font-size: 11px;
                    color: #6b7280;
                    margin-top: 6px;
                }
                
                @media (max-width: 1024px) {
                    .editor-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .editor-main {
                        border-right: none;
                    }
                }
                
                @media (max-width: 768px) {
                    .editor-header {
                        padding: 12px 16px;
                    }
                    
                    .editor-container {
                        padding: 20px;
                    }
                    
                    .title-input {
                        font-size: 28px;
                    }
                }
            `}</style>
        </div>
    )
}
