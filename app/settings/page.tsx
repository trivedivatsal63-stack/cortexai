'use client';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(() => router.push('/'));
    };

    return (
        <div className="settings-page">
            <div className="settings-container">
                <h1>Settings</h1>
                
                <div className="settings-section">
                    <h2>Account</h2>
                    <div className="settings-card">
                        <div className="settings-row">
                            <span className="settings-label">Email</span>
                            <span className="settings-value">{user?.primaryEmailAddress?.emailAddress}</span>
                        </div>
                        <div className="settings-row">
                            <span className="settings-label">Name</span>
                            <span className="settings-value">{user?.fullName || 'Not set'}</span>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Sign Out</h2>
                    <button className="sign-out-button" onClick={handleSignOut}>
                        Sign out of CortexAI
                    </button>
                </div>
            </div>

            <style jsx>{`
                .settings-page {
                    min-height: 100vh;
                    padding: 40px 20px;
                    background: var(--bg-primary);
                }

                .settings-container {
                    max-width: 600px;
                    margin: 0 auto;
                }

                h1 {
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 32px;
                }

                .settings-section {
                    margin-bottom: 32px;
                }

                .settings-section h2 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 12px;
                }

                .settings-card {
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .settings-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                }

                .settings-row:last-child {
                    border-bottom: none;
                }

                .settings-label {
                    color: var(--text-secondary);
                    font-size: 14px;
                }

                .settings-value {
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .sign-out-button {
                    width: 100%;
                    padding: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #ef4444;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }

                .sign-out-button:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
            `}</style>
        </div>
    );
}
