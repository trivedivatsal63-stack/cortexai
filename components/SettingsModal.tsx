'use client';
import { useEffect, useCallback } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = useCallback(async () => {
        await signOut(() => router.push('/'));
    }, [signOut, router]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="settings-overlay" 
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.15s ease',
            }}
        >
            <div 
                className="settings-modal"
                onClick={e => e.stopPropagation()}
                style={{
                    width: 380,
                    maxWidth: 'calc(100vw - 32px)',
                    background: '#111116',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: 20,
                    position: 'relative',
                    animation: 'scaleIn 0.18s ease',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
                }}
            >
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes scaleIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .settings-close {
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        width: 28px;
                        height: 28px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: transparent;
                        border: none;
                        border-radius: 6px;
                        color: #888;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }
                    .settings-close:hover {
                        background: rgba(255,255,255,0.08);
                        color: #fff;
                    }
                    .settings-content {
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                    }
                    .settings-section {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .settings-label {
                        font-size: 11px;
                        font-weight: 600;
                        color: #888;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        padding-left: 2px;
                    }
                    .settings-card {
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.06);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .settings-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 11px 13px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                    }
                    .settings-row:last-child {
                        border-bottom: none;
                    }
                    .settings-row-label {
                        font-size: 13px;
                        color: #888;
                    }
                    .settings-row-value {
                        font-size: 13px;
                        color: #e5e5e5;
                    }
                    .settings-divider {
                        height: 1px;
                        background: rgba(255,255,255,0.06);
                        margin: 2px 0;
                    }
                    .settings-signout {
                        width: 100%;
                        padding: 11px;
                        background: rgba(239, 68, 68, 0.1);
                        border: 1px solid rgba(239, 68, 68, 0.2);
                        border-radius: 10px;
                        color: #ef4444;
                        font-size: 13px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.15s ease;
                    }
                    .settings-signout:hover {
                        background: rgba(239, 68, 68, 0.2);
                        border-color: rgba(239, 68, 68, 0.3);
                    }
                `}</style>

                <button className="settings-close" onClick={onClose}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="settings-content">
                    <div className="settings-section">
                        <div className="settings-label">Account</div>
                        <div className="settings-card">
                            <div className="settings-row">
                                <span className="settings-row-label">Email</span>
                                <span className="settings-row-value">{user?.primaryEmailAddress?.emailAddress}</span>
                            </div>
                            <div className="settings-row">
                                <span className="settings-row-label">Name</span>
                                <span className="settings-row-value">{user?.fullName || 'Not set'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-divider" />

                    <div className="settings-section">
                        <div className="settings-label">Appearance</div>
                        <div className="settings-card">
                            <div className="settings-row">
                                <span className="settings-row-label">Theme</span>
                                <span className="settings-row-value">System</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-divider" />

                    <button className="settings-signout" onClick={handleSignOut}>
                        Sign out of CortexAI
                    </button>
                </div>
            </div>
        </div>
    );
}
