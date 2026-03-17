import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CyberAI — Cybersecurity Assistant',
  description: 'AI-powered cybersecurity learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0d12' }}>
        {children}
      </body>
    </html>
  )
}