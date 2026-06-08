'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Eye, EyeOff, Save, Send } from 'lucide-react'

const CATEGORIES = [
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'networking', label: 'Networking' },
  { value: 'programming', label: 'Programming' },
  { value: 'os', label: 'Operating Systems' },
  { value: 'general', label: 'General' },
  { value: 'tutorials', label: 'Tutorials' },
]

type Blog = {
  id: string; slug: string; title: string; content: string
  excerpt: string; category: string; published: boolean; user_id: string
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
        if (!b || b.user_id !== user?.id) { router.push('/blog'); return }
        setBlog(b)
        setTitle(b.title); setContent(b.content)
        setExcerpt(b.excerpt || ''); setCategory(b.category); setPublished(b.published)
      })
      .catch(() => router.push('/blog'))
      .finally(() => setLoading(false))
  }, [isLoaded, slug, user, router])

  async function handleSave(updatePublished: boolean) {
    if (!title.trim() || !content.trim()) { alert('Title and content are required'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/blogs/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content,
          excerpt: excerpt || content.slice(0, 150) + '...',
          category, published: updatePublished,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to save') }
      const { blog: updatedBlog } = await res.json()
      router.push(`/blog/${updatedBlog.slug}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally { setSaving(false) }
  }

  function insertMarkdown(before: string, after = '') {
    const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart, end = textarea.selectionEnd
    const selected = content.substring(start, end)
    setContent(content.substring(0, start) + before + selected + after + content.substring(end))
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, start + before.length + selected.length) }, 0)
  }

  if (loading || !isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <div className="w-4 h-4" style={{ border: '2px solid var(--accent-subtle)', borderTopColor: 'var(--accent)', borderRadius: '9999px', animation: 'spin 1s linear infinite' }} />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', maxWidth: '100vw', overflowX: 'hidden', background: 'var(--bg-primary)' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'var(--border)' }}>
        <div className="max-w-[740px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href={`/blog/${slug}`} className="flex items-center gap-1.5 text-xs no-underline" style={{ color: 'var(--text-tertiary)' }}>
            <ArrowLeft size={14} />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded" style={published
              ? { background: 'var(--accent-subtle)', color: 'var(--accent)' }
              : { background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }
            }>
              {published ? 'Published' : 'Draft'}
            </span>
            <button onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost text-[11px] h-8 px-3 gap-1.5">
              {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => handleSave(false)} disabled={saving}
              className="btn-secondary text-[11px] h-8 px-3 gap-1.5" style={{ opacity: saving ? 0.4 : 1 }}>
              <Save size={12} />
              Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="btn-primary text-xs h-8 px-4 gap-1.5">
              <Send size={12} />
              {saving ? 'Saving...' : (published ? 'Update' : 'Publish')}
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-16 px-6">
        <div className="max-w-[740px] mx-auto">
          {showPreview ? (
            <div>
              <h1 className="text-3xl tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>{title || 'Untitled'}</h1>
              <div className="flex items-center gap-3 text-sm mb-6 pb-6" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>{category}</span>
                <span>·</span>
                <span>{user?.fullName || user?.username}</span>
              </div>
              <article className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                <ReactMarkdown>{content || '*No content yet*'}</ReactMarkdown>
              </article>
            </div>
          ) : (
            <div>
              <input
                type="text"
                className="w-full mb-6 text-xl font-medium border-none outline-none bg-transparent"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Article title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
              />

              <div className="flex gap-0.5 p-1 rounded-xl mb-5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                {[
                  { label: <strong className="text-sm">B</strong>, title: 'Bold', fn: () => insertMarkdown('**', '**') },
                  { label: <em className="text-sm">I</em>, title: 'Italic', fn: () => insertMarkdown('*', '*') },
                  { label: <span className="text-xs font-bold">H</span>, title: 'Heading', fn: () => insertMarkdown('## ') },
                  { label: <span className="text-sm">•</span>, title: 'List', fn: () => insertMarkdown('\n- ') },
                  { label: <span className="text-[10px] font-mono font-bold">{'<>'}</span>, title: 'Code', fn: () => insertMarkdown('\n```\n', '\n```\n') },
                  { label: <span className="text-sm">🔗</span>, title: 'Link', fn: () => insertMarkdown('[', '](url)') },
                  { label: <span className="text-sm">"</span>, title: 'Quote', fn: () => insertMarkdown('\n> ') },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.fn}
                    title={btn.title}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all hover:bg-white/50"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <textarea
                className="editor-textarea w-full resize-none mb-6 font-mono text-sm leading-relaxed border-none outline-none bg-transparent"
                style={{ minHeight: 420, color: 'var(--text-secondary)' }}
                placeholder="Write your article in Markdown..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full h-9 px-3 text-sm rounded-xl border outline-none transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Excerpt</label>
                  <textarea
                    placeholder="Brief description (optional)"
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full resize-none px-3 py-2 text-sm rounded-xl border outline-none transition-all"
                    style={{
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <span className="text-[10px] mt-1 block" style={{ color: 'var(--text-tertiary)' }}>A short summary shown in the article list</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
