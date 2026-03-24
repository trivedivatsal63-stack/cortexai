'use client';
import { useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { InputBar } from './InputBar';
import { MessageItem } from './Message';
import type { Agent } from '@/agents';

type Message = { id: string; role: 'user' | 'assistant'; content: string; created_at: string };

interface ChatWindowProps {
    messages: Message[];
    messagesLoading: boolean;
    isSending: boolean;
    isAtLimit: boolean;
    agent: Agent;
    error: string;
    onSendMessage: (content: string) => void;
}

function WelcomeScreen() {
    return (
        <div className="welcome-screen">
            <div className="welcome-content">
                <div className="welcome-icon-wrapper">
                    <Image src="/cortex-icon.png" alt="CortexAI" width={56} height={56} className="welcome-icon" />
                </div>
                <h1 className="welcome-title">What would you like to know?</h1>
            </div>
        </div>
    );
}

export const ChatWindow = memo(function ChatWindow({
    messages,
    messagesLoading,
    isSending,
    isAtLimit,
    agent,
    error,
    onSendMessage,
}: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);
    const isNearBottomRef = useRef(true);
    const scrollPendingRef = useRef(false);

    const scrollToBottom = useCallback(() => {
        if (scrollPendingRef.current) return;
        scrollPendingRef.current = true;

        requestAnimationFrame(() => {
            scrollPendingRef.current = false;
            if (endRef.current) {
                endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        });
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        };

        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    const hasMessages = messages.length > 0;

    return (
        <div className="chat-window">
            <div className="chat-scroll" ref={scrollRef}>
                {messagesLoading && (
                    <div className="loading-skeleton">
                        {[280, 380, 220, 320].map((w, i) => (
                            <div key={i} className={`skeleton-msg ${i % 2 === 0 ? 'skeleton-user' : 'skeleton-ai'}`}>
                                <div className="skeleton-line" style={{ width: w }} />
                            </div>
                        ))}
                    </div>
                )}

                {!messagesLoading && messages.map((msg) => (
                    <MessageItem key={msg.id} msg={msg} />
                ))}

                {error && (
                    <div className="error-message">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <div ref={endRef} className="scroll-end" />
            </div>

            {!hasMessages && !messagesLoading && (
                <WelcomeScreen />
            )}

            <div className="chat-input-area">
                <InputBar
                    onSend={onSendMessage}
                    isSending={isSending}
                    isAtLimit={isAtLimit}
                    agent={agent}
                />
            </div>
        </div>
    );
});
