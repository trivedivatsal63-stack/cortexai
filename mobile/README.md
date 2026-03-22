# CyberAI Mobile App

Premium AI learning platform for CS students. React Native + Expo.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and add your Groq API key:
```
EXPO_PUBLIC_GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

### 3. Run the app
```bash
# Start Expo
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

## File Structure

```
cyberai-mobile/
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar
│   │   ├── index.tsx        # Home screen
│   │   ├── explore.tsx      # Explore topics
│   │   ├── blog.tsx         # Blog listing
│   │   └── profile.tsx      # Profile & settings
│   ├── chat/
│   │   └── [id].tsx         # Chat screen (streaming)
│   └── blog/
│       └── [slug].tsx       # Article reader
├── components/
│   ├── ChatBubble.tsx       # Message bubbles + markdown
│   ├── InputBox.tsx         # Message input with tools
│   ├── SidebarDrawer.tsx    # Slide-in navigation
│   ├── SuggestionCards.tsx  # Topic suggestion chips
│   └── BlogCard.tsx         # Blog post card
├── constants/
│   ├── theme.ts             # Colors, spacing, typography
│   └── modes.ts             # AI modes + system prompts
└── lib/
    ├── groq.ts              # Groq streaming API
    ├── api.ts               # Backend API calls
    └── store.ts             # AsyncStorage helpers
```

## Features

- **Streaming AI responses** via Groq (llama-3.3-70b)
- **5 Learning Modes**: General, Cybersecurity, Programming, Exam, Notes
- **Chat History** stored locally with AsyncStorage
- **10 free queries/day** with Pro upgrade CTA
- **Blog system** with article reader
- **Explore screen** with topic drill-down
- **Profile** with usage stats
- **Dark premium UI** matching website

## Groq Models Available

Change in `lib/groq.ts`:
- `llama-3.3-70b-versatile` (default, best quality)
- `llama-3.1-8b-instant` (fastest)
- `mixtral-8x7b-32768` (large context)
- `gemma2-9b-it`

## Adding Real Auth (Clerk)

1. Install: `npx expo install @clerk/clerk-expo`
2. Add `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env`
3. Wrap `_layout.tsx` with `<ClerkProvider>`
4. Replace mock user in `profile.tsx` with `useUser()` hook

## Connecting to Your Backend

Update `EXPO_PUBLIC_API_URL` in `.env` to your deployed Next.js URL.
The app will use your existing `/api/chat`, `/api/chats`, `/api/messages` endpoints.
