'use client';
import { useEffect, useCallback } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

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
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() };
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} />
            <div
                className="relative w-full max-w-[480px] rounded-2xl p-7 border"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md btn-ghost">
                    <X size={14} />
                </button>

                <h2 className="text-lg font-medium mb-5" style={{ color: 'var(--text-primary)' }}>Settings</h2>

                <div className="space-y-5">
                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-tertiary)' }}>Account</div>
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-center px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Email</span>
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.primaryEmailAddress?.emailAddress}</span>
                            </div>
                            <div className="flex justify-between items-center px-4 py-2.5">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Name</span>
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.fullName || 'Not set'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px" style={{ background: 'var(--border)' }} />

                    <div>
                        <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-tertiary)' }}>Appearance</div>
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex justify-between items-center px-4 py-2.5">
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Theme</span>
                                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>System</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-px" style={{ background: 'var(--border)' }} />

                    <button onClick={handleSignOut} className="btn-destructive w-full justify-center">
                        Sign out of AETHER
                    </button>
                </div>
            </div>
        </div>
    );
}
