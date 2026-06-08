import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AETHER — AI Learning Companion',
  description: 'Learn faster with AI-powered tutoring, research, and security agents.',
  icons: { icon: '/aether-icon.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/" signInFallbackRedirectUrl="/">
      <html lang="en" className={inter.className}>
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
