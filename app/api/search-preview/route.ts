import { NextResponse } from 'next/server'
import {
  requiresLiveData,
  fetchSearchResults,
  getSafeFavicon,
} from '@/lib/search-grounding'

export async function POST(req: Request) {
  try {
    const { query, agent } = await req.json()

    if (!query || !agent) {
      return NextResponse.json({ sources: [] })
    }

    const agentType = agent as 'learning' | 'research' | 'security'

    if (!requiresLiveData(query, agentType)) {
      return NextResponse.json({ sources: [] })
    }

    const searchResults = await fetchSearchResults(query)
    const sources = searchResults.map(r => ({
      title: r.title,
      url: r.url,
      favicon: getSafeFavicon(r.url),
    }))

    return NextResponse.json({ sources })
  } catch (error) {
    console.error('[search-preview] Error:', error)
    return NextResponse.json({ sources: [] })
  }
}
