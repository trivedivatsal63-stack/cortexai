import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0d12' }}>
            <SignUp forceRedirectUrl="/chat" />
        </main>
    )
}