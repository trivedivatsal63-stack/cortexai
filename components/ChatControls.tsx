// components/ChatControls.tsx
"use client";
import { useState } from "react";

interface ChatConfig {
    mode: "learning" | "cybersecurity";
    answerType: "short" | "detailed";
    examMode: boolean;
}

export function ChatControls({ config, onChange }: {
    config: ChatConfig;
    onChange: (c: ChatConfig) => void;
}) {
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0", flexWrap: "wrap" }}>

            {/* Mode toggle */}
            <div style={{ display: "flex", background: "#1a1a2e", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}>
                <button
                    onClick={() => onChange({ ...config, mode: "learning" })}
                    style={{
                        padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer",
                        background: config.mode === "learning" ? "rgba(0,255,178,0.15)" : "transparent",
                        color: config.mode === "learning" ? "#00FFB2" : "rgba(255,255,255,0.4)",
                        transition: "all 0.2s",
                    }}
                >🟢 Learning</button>
                <button
                    onClick={() => onChange({ ...config, mode: "cybersecurity" })}
                    style={{
                        padding: "6px 14px", borderRadius: 6, fontSize: 12, border: "none", cursor: "pointer",
                        background: config.mode === "cybersecurity" ? "rgba(255,107,107,0.15)" : "transparent",
                        color: config.mode === "cybersecurity" ? "#FF6B6B" : "rgba(255,255,255,0.4)",
                        transition: "all 0.2s",
                    }}
                >🔴 Cyber</button>
            </div>

            {/* Answer type */}
            <select
                value={config.answerType}
                onChange={e => onChange({ ...config, answerType: e.target.value as "short" | "detailed" })}
                style={{ background: "#1a1a2e", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
            >
                <option value="short">⚡ Short Answer</option>
                <option value="detailed">📖 Detailed Answer</option>
            </select>

            {/* Exam mode */}
            <button
                onClick={() => onChange({ ...config, examMode: !config.examMode })}
                style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, border: "1px solid",
                    borderColor: config.examMode ? "#FFD700" : "rgba(255,255,255,0.1)",
                    background: config.examMode ? "rgba(255,215,0,0.1)" : "transparent",
                    color: config.examMode ? "#FFD700" : "rgba(255,255,255,0.4)",
                    cursor: "pointer", transition: "all 0.2s",
                }}

            >
                📋 Exam Mode {config.examMode ? "ON" : "OFF"}
            </button>
        </div>
    );
}