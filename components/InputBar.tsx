'use client';
import { useState, useRef, useEffect, memo } from 'react';
import type { Agent } from '@/agents';

interface InputBarProps {
    onSend: (text: string) => void;
    isSending: boolean;
    isAtLimit: boolean;
    agent: Agent;
    disabled?: boolean;
}

export const InputBar = memo(function InputBar({
    onSend,
    isSending,
    isAtLimit,
    agent,
    disabled = false,
}: InputBarProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const onSendRef = useRef(onSend);

    useEffect(() => {
        onSendRef.current = onSend;
    }, [onSend]);

    useEffect(() => {
        if (textareaRef.current && !disabled) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    function resize() {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setValue(e.target.value);
        resize();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    function submit() {
        const trimmed = value.trim();
        if (!trimmed || isAtLimit || disabled) return;
        onSendRef.current(trimmed);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = '24px';
            textareaRef.current.focus();
        }
    }

    const placeholder = isAtLimit
        ? 'Daily limit reached — resets at midnight UTC'
        : disabled
        ? 'Select an agent to begin...'
        : `Message ${agent.charAt(0).toUpperCase() + agent.slice(1)} agent...`;

    return (
        <div className="input-bar-container">
            <div className={`input-bar ${disabled || isAtLimit ? 'disabled' : ''}`}>
                <textarea
                    ref={textareaRef}
                    className="input-textarea"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isAtLimit}
                    rows={1}
                />
                <button
                    className={`send-btn ${value.trim() && !isSending && !isAtLimit && !disabled ? 'active' : ''}`}
                    onClick={submit}
                    disabled={!value.trim() || isSending || isAtLimit || disabled}
                >
                    {isSending ? (
                        <div className="send-spinner" />
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    )}
                </button>
            </div>
            <div className="input-hint">
                <span>Enter to send</span>
                <span className="hint-sep">•</span>
                <span>Shift + Enter for new line</span>
            </div>
        </div>
    );
});
