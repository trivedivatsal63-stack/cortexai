'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Search, ArrowUpRight, Clock, User } from 'lucide-react'

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

const CATEGORIES = ['All', 'Cybersecurity', 'Networking', 'Programming', 'OS', 'General', 'Tutorials']

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const container = { animate: { transition: { staggerChildren: 0.05 } } }
const item = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }

export default function BlogPage() {
  const { user } = useUser()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCat, setSelectedCat] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const loadBlogs = useCallback(() => {
    setLoading(true)
    setError('')
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => {
        if (d.error && d.retry) setError('Unable to connect to database')
        else setBlogs(d.blogs || [])
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadBlogs() }, [loadBlogs])

  const filtered = blogs.filter(b => {
    const matchesCat = selectedCat === 'All' || b.category.toLowerCase() === selectedCat.toLowerCase()
    const matchesSearch = !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-primary)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1000px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>S</div>
            <span className="text-sm font-medium tracking-tight" style={{ color: 'var(--text-primary)' }}>SENTINEL</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm" style={{ color: 'var(--text-secondary)' }}>Blog</Link>
            <Link href="/chat" className="btn-primary text-xs h-8 px-4 gap-1.5">
              Open App <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-6 px-6">
        <motion.div className="max-w-[1000px] mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest uppercase mb-2"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>Stories & Insights</p>
            <h1 className="text-[36px] md:text-[44px] font-medium tracking-tight mb-3 leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              Blog
            </h1>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-tertiary)' }}>
              Thoughts on security, engineering, and building an AI-native SOC platform.
            </p>
          </div>

          <div className="max-w-lg mx-auto mb-8">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border outline-none transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,106,247,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-12">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={selectedCat === cat
                  ? { background: 'var(--accent)', color: 'var(--accent-fg)' }
                  : { color: 'var(--text-tertiary)', background: 'transparent' }
                }
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-[1000px] mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="space-y-3">
                    <div className="h-3 w-16 rounded" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="h-5 w-full rounded" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="h-5 w-3/4 rounded" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="h-3 w-full rounded" style={{ background: 'var(--bg-tertiary)' }} />
                    <div className="h-3 w-1/2 rounded" style={{ background: 'var(--bg-tertiary)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div className="p-12 text-center rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }} variants={item}>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              <button onClick={loadBlogs} className="btn-primary text-xs">Try Again</button>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div className="p-12 text-center" variants={item}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>No articles found</p>
              <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
                {searchQuery ? 'Try a different search term' : 'Check back soon for new articles.'}
              </p>
              {user && (
                <Link href="/blog/new" className="btn-primary text-xs">Write an Article</Link>
              )}
            </motion.div>
          ) : (
            <motion.div variants={container} initial="initial" animate="animate">
              {featured && (
                <motion.div variants={item} className="mb-8">
                  <Link href={`/blog/${featured.slug}`} className="block no-underline group">
                    <div className="rounded-xl border transition-all duration-300 p-7 flex flex-col md:flex-row md:items-center gap-6"
                      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mb-3"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          {featured.category}
                        </span>
                        <h2 className="text-xl font-medium mb-2 leading-snug group-hover:opacity-80 transition-opacity"
                          style={{ color: 'var(--text-primary)' }}>
                          {featured.title}
                        </h2>
                        <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                          {featured.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="flex items-center gap-1.5">
                            <User size={12} />
                            {featured.author?.name || 'Anonymous'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatDate(featured.created_at)}
                          </span>
                          <span>{featured.read_time}</span>
                        </div>
                      </div>
                      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-all duration-300 group-hover:bg-accent/10"
                        style={{ background: 'var(--bg-tertiary)' }}>
                        <ArrowUpRight size={18} style={{ color: 'var(--text-tertiary)' }} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              <div className="grid md:grid-cols-3 gap-5">
                {rest.map((blog, i) => (
                  <motion.div key={blog.id} variants={item}>
                    <Link href={`/blog/${blog.slug}`} className="block no-underline h-full group">
                      <div className="h-full rounded-xl border transition-all duration-300 p-6 flex flex-col"
                        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <span className="inline-block self-start px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider mb-3"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                          {blog.category}
                        </span>
                        <h3 className="text-base font-medium mb-2 leading-snug group-hover:opacity-80 transition-opacity line-clamp-2"
                          style={{ color: 'var(--text-primary)' }}>
                          {blog.title}
                        </h3>
                        <p className="text-sm leading-relaxed mb-5 flex-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium"
                              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                              {blog.author?.name?.charAt(0) || 'A'}
                            </div>
                            <span>{blog.author?.name || 'Anonymous'}</span>
                          </div>
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            {formatDate(blog.created_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="px-6 pb-10 text-center">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          SENTINEL — AI Learning Platform + SOC Suite
        </p>
      </footer>
    </div>
  )
}
