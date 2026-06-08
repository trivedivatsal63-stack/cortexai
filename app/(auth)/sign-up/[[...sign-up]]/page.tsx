import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>AETHER</span>
            </div>
            <SignUp forceRedirectUrl="/chat" />
        </main>
    )
}
