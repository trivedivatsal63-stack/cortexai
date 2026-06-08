# SENTINEL

AI-powered learning companion and SOC platform for CS students and security analysts.

## What is SENTINEL

SENTINEL is a dual-purpose platform that combines an intelligent AI tutor with a security operations center (SOC) suite. Students use it to learn any subject through conversational AI, while security professionals leverage built-in SOC tools for alert triage, threat intelligence, incident response, and forensics. A smart model router selects the best AI for each query — fast for simple questions, deep for complex analysis.

## Features

- **Learning Agent** — AI tutoring across all subjects with support for exam mode, notes, and code examples
- **Research Agent** — Deep research with live web search grounding via Tavily
- **Security Agent** — Cybersecurity advisory with threat intelligence enrichment
- **SOC Modules**: Log analysis, Kali Linux mentoring, bug bounty guidance, malware analysis, network security, digital forensics
- **Blog** — Built-in blog with Markdown editing, categories, and SEO metadata
- **User auth** — Clerk authentication with free/pro tier limits
- **Usage tracking** — 50 queries/day free tier, 500/day pro tier

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **AI**: Groq SDK (LLM inference), Anthropic SDK (fallback)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4
- **Search**: Tavily API (web grounding)
- **Mobile**: React Native + Expo (in `mobile/`)

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in the values
3. Run the Supabase schema in `supabase/blog-schema.sql`
4. Install dependencies and start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Key | Description |
|-----|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (from Clerk dashboard) |
| `CLERK_SECRET_KEY` | Clerk secret key (from Clerk dashboard) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (not anon) |
| `GROQ_API_KEY` | Groq API key for LLM inference |
| `TAVILY_API_KEY` | Tavily API key for web search grounding (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude fallback (optional) |

## Screenshots

[Add screenshots here]

## License

MIT
