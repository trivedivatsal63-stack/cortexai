// components/MermaidDiagram.tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
    code: string;
}

export function MermaidDiagram({ code }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function render() {
            try {
                const mermaid = (await import("mermaid")).default;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    themeVariables: {
                        primaryColor: "#00FFB2",
                        primaryTextColor: "#E8EAF0",
                        lineColor: "#0099FF",
                        background: "#0D1117",
                    },
                });

                const id = `mermaid-${Date.now()}`;
                const { svg } = await mermaid.render(id, code);
                if (!cancelled && ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch {
                if (!cancelled) setError(true);
            }
        }

        render();
        return () => { cancelled = true; };
    }, [code]);

    if (error) {
        return (
            <div style={{ padding: 16, background: "rgba(255,100,100,0.1)", borderRadius: 8, fontSize: 13, color: "rgba(232,234,240,0.5)" }}>
                ⚠ Diagram could not render — showing text description instead.
            </div>
        );
    }

    return (
        <div
            ref={ref}
            style={{
                background: "rgba(13,17,23,0.8)",
                border: "1px solid rgba(0,255,178,0.15)",
                borderRadius: 12,
                padding: 24,
                margin: "12px 0",
                overflow: "auto",
            }}
        />
    );
}