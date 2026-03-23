'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

type Blog = {
    id: string
    slug: string
    title: string
    excerpt: string
    category: string
    read_time: string
    created_at: string
    author: { name: string; avatar_url: string | null } | null
}

const CATEGORIES = ['All', 'cybersecurity', 'networking', 'programming', 'os', 'general', 'tutorials']

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

export default function BlogPage() {
    const { user } = useUser()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [retrying, setRetrying] = useState(false)
    const [selectedCat, setSelectedCat] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    const loadBlogs = () => {
        setLoading(true)
        setError('')
        fetch('/api/blogs')
            .then(r => r.json())
            .then(d => {
                if (d.error && d.retry) {
                    setError('Unable to connect to database')
                } else {
                    setBlogs(d.blogs || [])
                }
            })
            .catch(() => setError('Network error'))
            .finally(() => {
                setLoading(false)
                setRetrying(false)
            })
    }

    useEffect(() => {
        loadBlogs()
    }, [])

    const filtered = blogs.filter(b => {
        const matchesCat = selectedCat === 'All' || b.category.toLowerCase() === selectedCat.toLowerCase()
        const matchesSearch = !searchQuery || 
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCat && matchesSearch
    })

    return (
        <div className="blog-root">
            <header className="blog-header">
                <div className="blog-header-content">
                    <div className="blog-title-row">
                        <div>
                            <h1 className="blog-title">Blog & Learn</h1>
                            <p className="blog-subtitle">Share your knowledge with the community</p>
                        </div>
                        {user && (
                            <Link href="/blog/new" className="write-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Write a Post
                            </Link>
                        )}
                    </div>
                    
                    <div className="blog-search-bar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="blog-categories">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`cat-btn ${selectedCat === cat ? 'cat-active' : ''}`}
                                onClick={() => setSelectedCat(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="blog-main">
                {loading ? (
                    <div className="blog-loading">
                        <div className="blog-skeleton-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="blog-skeleton">
                                    <div className="skel-img" />
                                    <div className="skel-line skel-title" />
                                    <div className="skel-line" />
                                    <div className="skel-line skel-short" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="blog-empty">
                        <div className="empty-icon">⚠️</div>
                        <h2>Connection Error</h2>
                        <p>{error}. Please check your Supabase configuration.</p>
                        <button className="empty-cta" onClick={loadBlogs}>
                            Try Again
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="blog-empty">
                        <div className="empty-icon">📝</div>
                        <h2>No articles found</h2>
                        <p>{searchQuery ? 'Try a different search term' : 'Be the first to write an article!'}</p>
                        {user && (
                            <Link href="/blog/new" className="empty-cta">
                                Write an Article
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="blog-grid">
                        {filtered.map(blog => (
                            <Link key={blog.id} href={`/blog/${blog.slug}`} className="blog-card">
                                <div className="blog-card-img">
                                    <div className="blog-card-category">{blog.category}</div>
                                </div>
                                <div className="blog-card-body">
                                    <h3 className="blog-card-title">{blog.title}</h3>
                                    <p className="blog-card-excerpt">{blog.excerpt}</p>
                                    <div className="blog-card-meta">
                                        <div className="blog-card-author">
                                            <div className="author-avatar">
                                                {blog.author?.name?.charAt(0) || 'A'}
                                            </div>
                                            <span>{blog.author?.name || 'Anonymous'}</span>
                                        </div>
                                        <div className="blog-card-info">
                                            <span>{formatDate(blog.created_at)}</span>
                                            <span className="dot">•</span>
                                            <span>{blog.read_time}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                
                .blog-root {
                    min-height: 100vh;
                    background: #0c0c0f;
                    color: #f0f0f5;
                    font-family: 'Outfit', sans-serif;
                }
                
                .blog-header {
                    background: linear-gradient(180deg, rgba(124,106,247,0.08) 0%, transparent 100%);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    padding: 48px 0 32px;
                }
                
                .blog-header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 32px;
                }
                
                .blog-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                
                .blog-title {
                    font-size: 36px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin: 0 0 8px;
                    background: linear-gradient(135deg, #f0f0f5 0%, #a78bfa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .blog-subtitle {
                    font-size: 16px;
                    color: #8a8a9a;
                    margin: 0;
                }
                
                .write-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #7c6af7 0%, #4f8ef7 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-family: inherit;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(124,106,247,0.3);
                }
                
                .write-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 28px rgba(124,106,247,0.4);
                }
                
                .blog-search-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    transition: all 0.2s;
                }
                
                .blog-search-bar:focus-within {
                    border-color: rgba(124,106,247,0.4);
                    background: rgba(255,255,255,0.07);
                }
                
                .blog-search-bar svg {
                    color: #6b7280;
                    flex-shrink: 0;
                }
                
                .blog-search-bar input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    font-family: inherit;
                    font-size: 15px;
                    color: #f0f0f5;
                }
                
                .blog-search-bar input::placeholder {
                    color: #6b7280;
                }
                
                .blog-categories {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                
                .cat-btn {
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 20px;
                    color: #8a8a9a;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                
                .cat-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #f0f0f5;
                }
                
                .cat-active {
                    background: rgba(124,106,247,0.2) !important;
                    border-color: rgba(124,106,247,0.5) !important;
                    color: #e0d4ff !important;
                }
                
                .blog-main {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 32px;
                }
                
                .blog-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 24px;
                }
                
                .blog-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    overflow: hidden;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s;
                }
                
                .blog-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(124,106,247,0.3);
                    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
                }
                
                .blog-card-img {
                    height: 160px;
                    background: linear-gradient(135deg, rgba(124,106,247,0.2) 0%, rgba(79,142,247,0.2) 100%);
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .blog-card-img::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237c6af7' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
                
                .blog-card-category {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    padding: 4px 12px;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #c4b5fd;
                }
                
                .blog-card-body {
                    padding: 20px;
                }
                
                .blog-card-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 0 0 10px;
                    line-height: 1.4;
                    color: #f0f0f5;
                }
                
                .blog-card-excerpt {
                    font-size: 14px;
                    color: #8a8a9a;
                    line-height: 1.6;
                    margin: 0 0 16px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .blog-card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #6b7280;
                }
                
                .blog-card-author {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .author-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7c6af7, #4f8ef7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .blog-card-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .dot {
                    opacity: 0.5;
                }
                
                .blog-empty {
                    text-align: center;
                    padding: 80px 20px;
                }
                
                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                }
                
                .blog-empty h2 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px;
                }
                
                .blog-empty p {
                    font-size: 16px;
                    color: #8a8a9a;
                    margin: 0 0 24px;
                }
                
                .empty-cta {
                    display: inline-flex;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #7c6af7 0%, #4f8ef7 100%);
                    border-radius: 12px;
                    color: #fff;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                
                .empty-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 28px rgba(124,106,247,0.4);
                }
                
                .blog-loading {
                    padding: 20px 0;
                }
                
                .blog-skeleton-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 24px;
                }
                
                .blog-skeleton {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 0;
                    overflow: hidden;
                }
                
                .skel-img {
                    height: 160px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                
                .skel-line {
                    height: 16px;
                    margin: 16px 20px 0;
                    background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 4px;
                }
                
                .skel-title {
                    height: 20px;
                    width: 80%;
                }
                
                .skel-short {
                    width: 40%;
                    margin-bottom: 20px;
                }
                
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                @media (max-width: 768px) {
                    .blog-header-content {
                        padding: 0 16px;
                    }
                    
                    .blog-title-row {
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .write-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .blog-main {
                        padding: 24px 16px;
                    }
                    
                    .blog-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}
