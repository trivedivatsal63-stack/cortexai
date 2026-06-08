import { tavily } from '@tavily/core'

if (!process.env.TAVILY_API_KEY) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[search-grounding] TAVILY_API_KEY is not set. ' +
      'Search grounding will be disabled. Add it to .env.local.'
    )
  }
}

const client = process.env.TAVILY_API_KEY
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null

const RECENCY_SIGNALS = [
  'current', 'latest', 'recent', 'today', 'now', 'right now',
  'this year', 'this month', 'this week', 'trend', 'trends',
  'news', 'update', 'updates', 'happening', 'situation',
  '2024', '2025', '2026', 'new', 'modern', 'emerging',
]

const TIMELESS_SIGNALS = [
  'what is', 'define', 'explain', 'how does', 'difference between',
  'example of', 'syntax', 'algorithm', 'history of', 'concept',
]

const SECURITY_KEYWORDS = [
  'cve', 'cve-', 'malware', 'ransomware', 'trojan', 'virus',
  'exploit', 'vulnerability', 'vulnerabilities', 'zero-day', 'zeroday',
  'threat actor', 'apt', 'apt28', 'apt29', 'lazarus', 'fancy bear',
  'ioc', 'indicator of compromise', 'indicators of compromise',
  'phishing', 'breach', 'data breach', 'cyber attack', 'cyberattack',
  'ddos', 'botnet', 'backdoor', 'payload', 'shellcode',
  'cve-2024', 'cve-2025', 'cve-2026',
]

export function requiresLiveData(
  query: string,
  agent: 'learning' | 'research' | 'security',
  forceSearch = false
): boolean {
  if (forceSearch) return true
  if (agent === 'learning') return false

  const lower = query.toLowerCase()

  if (agent === 'security') {
    const hasSecurityKeyword = SECURITY_KEYWORDS.some(kw => lower.includes(kw))
    if (hasSecurityKeyword) return true
  }

  const timelessScore = TIMELESS_SIGNALS.filter(s => lower.includes(s)).length
  const recencyScore = RECENCY_SIGNALS.filter(s => lower.includes(s)).length

  if (timelessScore > recencyScore) return false

  return recencyScore > 0
}

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

export async function fetchSearchResults(
  query: string
): Promise<SearchResult[]> {
  if (!client) return []

  try {
    const response = await client.search(query, {
      searchDepth: 'advanced',
      maxResults: 5,
      includeAnswer: false,
      includeRawContent: false,
    })

    return response.results.map(r => ({
      title: r.title ?? '',
      url: r.url ?? '',
      content: r.content ?? '',
      score: r.score ?? 0,
    }))
  } catch (error) {
    console.error('[search-grounding] Tavily search failed:', error)
    return []
  }
}

export function getSafeFavicon(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch {
    return ''
  }
}

export function buildGroundingContext(
  results: SearchResult[],
  query: string
): string {
  if (results.length === 0) return ''

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedResults = results
    .map((r, i) => `[${i + 1}] ${r.title}\nSource: ${r.url}\n${r.content}`)
    .join('\n\n---\n\n')

  return `
LIVE SEARCH CONTEXT
Retrieved: ${currentDate}
Query: "${query}"

The following are current search results. Use these as your PRIMARY source
for any time-sensitive information. Do not contradict them with older
training data. If the search results do not contain enough information
to answer the query fully, say so explicitly rather than filling gaps
with potentially outdated knowledge.

${formattedResults}

END OF SEARCH CONTEXT
---
`
}
