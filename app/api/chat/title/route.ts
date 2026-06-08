import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { message } = await req.json()

  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) {
    return NextResponse.json({ title: 'New Chat' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 20,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'Generate a 4-5 word title for a chat that starts with this message. Return only the title, no quotes, no punctuation.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ title: 'New Chat' })
    }

    const data = await response.json()
    const title = (data.choices?.[0]?.message?.content ?? '').trim()

    return NextResponse.json({ title: title || 'New Chat' })
  } catch {
    return NextResponse.json({ title: 'New Chat' })
  }
}
