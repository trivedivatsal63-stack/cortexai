import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProvider>
  )
}
