'use client';

export default function PremiumPage() {
    return (
        <div className="premium-page">
            <div className="premium-container">
                <div className="premium-badge">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    Premium
                </div>

                <h1>Upgrade to CortexAI Premium</h1>
                <p className="premium-subtitle">Unlock unlimited learning and research capabilities</p>

                <div className="premium-features">
                    <div className="premium-feature">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Unlimited daily queries</span>
                    </div>
                    <div className="premium-feature">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Priority access to new AI models</span>
                    </div>
                    <div className="premium-feature">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Advanced research agents</span>
                    </div>
                    <div className="premium-feature">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Export notes and conversations</span>
                    </div>
                </div>

                <button className="premium-button">
                    Coming Soon
                </button>

                <p className="premium-note">Premium features will be available in an upcoming update.</p>
            </div>

            <style jsx>{`
                .premium-page {
                    min-height: 100vh;
                    padding: 60px 20px;
                    background: var(--bg-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .premium-container {
                    max-width: 480px;
                    text-align: center;
                }

                .premium-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: linear-gradient(135deg, rgba(124, 106, 247, 0.2), rgba(79, 142, 247, 0.2));
                    border: 1px solid rgba(124, 106, 247, 0.3);
                    border-radius: 20px;
                    color: #7c6af7;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 20px;
                }

                h1 {
                    font-size: 32px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 12px;
                    letter-spacing: -0.02em;
                }

                .premium-subtitle {
                    font-size: 16px;
                    color: var(--text-muted);
                    margin-bottom: 40px;
                }

                .premium-features {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 40px;
                    text-align: left;
                }

                .premium-feature {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bg-elevated);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .premium-feature svg {
                    color: #10b981;
                    flex-shrink: 0;
                }

                .premium-button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #7c6af7, #4f8ef7);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 16px;
                    opacity: 0.6;
                }

                .premium-button:hover {
                    opacity: 0.8;
                    transform: translateY(-1px);
                }

                .premium-note {
                    font-size: 13px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
