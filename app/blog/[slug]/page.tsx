'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Clock, User, Share2, Calendar } from 'lucide-react'

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
  author: { name: string; avatar_url: string | null; bio: string | null } | null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user } = useUser()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

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

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="max-w-[680px] mx-auto px-6 pt-32">
          <div className="space-y-4">
            <div className="h-4 w-20 rounded" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-8 w-3/4 rounded" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-4 w-full rounded" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-4 w-5/6 rounded" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-4 w-2/3 rounded" style={{ background: 'var(--bg-secondary)' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', background: 'var(--bg-primary)' }}>
        <motion.div className="p-12 text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Article Not Found</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="btn-primary text-xs">← Back to Blog</Link>
        </motion.div>
      </div>
    )
  }

  const isOwner = user?.id === blog.user_id

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-primary)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5" style={{ background: 'var(--bg-secondary)' }}>
        <div className="h-full transition-all duration-150 ease-out" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
      </div>

      <nav className="fixed top-0.5 left-0 right-0 z-40 border-b backdrop-blur-md overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'var(--border)' }}>
        <div className="max-w-[680px] mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-1.5 text-xs no-underline transition-colors"
            style={{ color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Link href={`/blog/edit/${slug}`} className="btn-secondary text-[11px] h-7 px-3">Edit</Link>
                <button onClick={handleDelete} className="btn-danger text-[11px] h-7 px-3">Delete</button>
              </>
            )}
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="btn-ghost text-[11px] h-7 px-3 gap-1.5"
            >
              <Share2 size={12} />
              Share
            </button>
          </div>
        </div>
      </nav>

      <article className="max-w-[680px] mx-auto px-6 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider mb-4"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
              {blog.category}
            </span>
            <h1 className="text-[28px] md:text-[34px] font-medium tracking-tight leading-tight mb-6"
              style={{ color: 'var(--text-primary)' }}>
              {blog.title}
            </h1>
            <div className="flex items-center gap-5 text-sm flex-wrap" style={{ color: 'var(--text-tertiary)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  {blog.author?.name?.charAt(0) || 'A'}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{blog.author?.name || 'Anonymous'}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(blog.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {blog.read_time}
              </span>
            </div>
          </div>

          <div className="text-[15px] leading-[1.8]" style={{ color: 'var(--text-secondary)' }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-medium mt-12 mb-5" style={{ color: 'var(--text-primary)' }}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-medium mt-10 mb-4" style={{ color: 'var(--text-primary)' }}>{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-8 mb-3" style={{ color: 'var(--text-primary)' }}>{children}</h3>,
                p: ({ children }) => <p className="my-5">{children}</p>,
                strong: ({ children }) => <strong className="font-medium" style={{ color: 'var(--text-primary)' }}>{children}</strong>,
                ul: ({ children }) => <ul className="my-5 pl-6 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="my-5 pl-6 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="pl-1" style={{ listStyleType: 'disc' }}>{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="pl-5 py-4 my-8 rounded-r-lg italic text-sm leading-relaxed"
                    style={{ borderLeft: '2px solid var(--accent)', background: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isBlock = !!className
                  return isBlock
                    ? <code className="block text-sm leading-relaxed px-1" style={{ color: 'var(--accent)' }}>{children}</code>
                    : <code className="text-sm px-1.5 py-0.5 rounded" style={{ color: 'var(--accent)', background: 'var(--accent-subtle)' }}>{children}</code>
                },
                pre: ({ children }) => (
                  <pre className="overflow-x-auto my-8 text-sm font-mono rounded-xl p-5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                    {children}
                  </pre>
                ),
                hr: () => <hr className="my-10" style={{ border: 'none', borderTop: '1px solid var(--border)' }} />,
                a: ({ children, href }) => (
                  <a className="underline underline-offset-2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent)', textDecorationColor: 'var(--accent)' }}
                    href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img src={src} alt={alt || ''} className="w-full rounded-xl my-8" />
                ),
                table: ({ children }) => <table className="w-full border-collapse my-8 text-sm">{children}</table>,
                th: ({ children }) => <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>{children}</th>,
                td: ({ children }) => <td className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>{children}</td>,
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          <div className="mt-14 pt-8 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Category:</span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
                style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                {blog.category}
              </span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs transition-colors"
              style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
            >
              <Share2 size={13} />
              Copy Link
            </button>
          </div>
        </motion.div>
      </article>

      {blog.author?.bio && (
        <section className="px-6 pb-20">
          <div className="max-w-[680px] mx-auto">
            <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>
                  {blog.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{blog.author.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{blog.author.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 pb-16">
        <div className="max-w-[680px] mx-auto text-center">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            Back to all articles
          </Link>
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
