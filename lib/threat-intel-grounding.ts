import type { SearchResult } from './search-grounding'
import { getSafeFavicon } from './search-grounding'

const THREAT_INTEL_BASE = process.env.THREAT_INTEL_API_URL || 'http://localhost:8000'

interface ThreatIntelArticle {
  id: string
  title: string
  url: string
  source: string
  summary: string
  severity: string
  published: string
}

interface ThreatIntelCVE {
  cve_id: string
  description: string
  severity: string
  cvss_score: number | null
  published: string
}

interface ThreatIntelAlert {
  id: string
  title: string
  description: string
  source: string
  severity: string
  reported_at: string
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${THREAT_INTEL_BASE}${path}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    console.error(`[threat-intel] Failed to fetch ${path}:`, error)
    return null
  }
}

async function fetchArticles(query: string): Promise<SearchResult[]> {
  const data = await fetchJson<ThreatIntelArticle[]>(
    `/api/articles?limit=5&search=${encodeURIComponent(query)}`
  )
  if (!data || !Array.isArray(data)) return []
  return data.map(a => ({
    title: a.title,
    url: a.url,
    content: a.summary || a.title,
    score: a.severity === 'CRITICAL' ? 1 : a.severity === 'HIGH' ? 0.9 : 0.7,
  }))
}

async function fetchCVEs(query: string): Promise<SearchResult[]> {
  const data = await fetchJson<ThreatIntelCVE[]>(
    `/api/cves?limit=5&search=${encodeURIComponent(query)}`
  )
  if (!data || !Array.isArray(data)) return []
  return data.map(c => ({
    title: c.cve_id,
    url: `https://nvd.nist.gov/vuln/detail/${c.cve_id}`,
    content: `[${c.severity} | CVSS: ${c.cvss_score ?? 'N/A'}] ${c.description}`,
    score: c.cvss_score ? c.cvss_score / 10 : 0.7,
  }))
}

async function fetchIndiaAlerts(): Promise<SearchResult[]> {
  const data = await fetchJson<ThreatIntelAlert[]>(
    '/api/india/alerts?limit=5'
  )
  if (!data || !Array.isArray(data)) return []
  return data.map(a => ({
    title: a.title,
    url: '',
    content: `[${a.severity}] ${a.description}`,
    score: a.severity === 'CRITICAL' ? 1 : a.severity === 'HIGH' ? 0.9 : 0.7,
  }))
}

export function isThreatIntelReachable(): boolean {
  return !!process.env.THREAT_INTEL_API_URL || true
}

export async function fetchThreatIntelResults(
  query: string,
  agent: 'learning' | 'research' | 'security'
): Promise<SearchResult[]> {
  const results: SearchResult[] = []

  if (agent === 'security') {
    const [articles, cves, alerts] = await Promise.all([
      fetchArticles(query),
      fetchCVEs(query),
      fetchIndiaAlerts(),
    ])
    results.push(...articles, ...cves, ...alerts)
  } else if (agent === 'research') {
    const [articles] = await Promise.all([
      fetchArticles(query),
    ])
    results.push(...articles)
  }

  return results
}

export function buildThreatIntelContext(
  results: SearchResult[],
  source: 'threat-intel'
): string {
  if (results.length === 0) return ''

  const formatted = results
    .map((r, i) => `[${i + 1}] ${r.title}${r.url ? `\nSource: ${r.url}` : ''}\n${r.content}`)
    .join('\n\n---\n\n')

  return `
THREAT INTEL CONTEXT
The following are structured threat intelligence results.

${formatted}

END OF THREAT INTEL CONTEXT
---
`
}

export function getThreatIntelFavicon(url: string): string {
  return getSafeFavicon(url)
}
