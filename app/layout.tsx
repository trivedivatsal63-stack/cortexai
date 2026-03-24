import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider 
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/"
    >
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
