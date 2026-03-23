// lib/model-router.ts

type Complexity = "simple" | "medium" | "complex";
type Mode = "learning" | "cybersecurity";
type AnswerType = "short" | "detailed";

interface RouteDecision {
    model: string;
    maxTokens: number;
    provider: "groq";
    reasoning: string;
}

interface QueryContext {
    query: string;
    mode: Mode;
    answerType: AnswerType;
    examMode: boolean;
}

// ─────────────────────────────
// Complexity detection
// ─────────────────────────────

const SIMPLE_SIGNALS = [
    /^what is /i,
    /^define /i,
    /^who is /i,
    /^full form/i,
    /^expand/i,
];

const COMPLEX_SIGNALS = [
    /explain in detail/i,
    /how does .+ work/i,
    /compare/i,
    /difference between/i,
    /architecture/i,
    /step.by.step/i,
    /implement/i,
    /design/i,
];

const DIAGRAM_SIGNALS = [
    /diagram/i,
    /flowchart/i,
    /draw/i,
    /visual/i,
    /architecture/i,
];

function detectComplexity(query: string): Complexity {
    const words = query.split(/\s+/).length;

    if (words <= 5) return "simple";
    if (words >= 18) return "complex";

    if (SIMPLE_SIGNALS.some(p => p.test(query))) return "simple";
    if (COMPLEX_SIGNALS.some(p => p.test(query))) return "complex";

    return "medium";
}

export function detectDiagramNeeded(query: string): boolean {
    return DIAGRAM_SIGNALS.some(p => p.test(query));
}

// ─────────────────────────────
// Model constants
// ─────────────────────────────

// Keep model IDs in one place so a future deprecation is a one-line change.
const MODELS = {
    fast: "llama-3.1-8b-instant",      // ✅ active  — simple / exam
    balanced: "llama-3.3-70b-versatile",   // ✅ active  — medium / complex / diagrams
    //         "llama-3.1-70b-versatile"    // ❌ decommissioned 2025-01-24
} as const;

// ─────────────────────────────
// Router
// ─────────────────────────────

export function routeToModel(ctx: QueryContext): RouteDecision {

    const complexity = detectComplexity(ctx.query);
    const needsDiagram = detectDiagramNeeded(ctx.query);

    // Exam mode → cheapest
    if (ctx.examMode) {
        return {
            model: MODELS.fast,
            maxTokens: ctx.answerType === "short" ? 200 : 400,
            provider: "groq",
            reasoning: "Exam mode → 8B fast",
        };
    }

    // Cybersecurity complex → 70B
    if (ctx.mode === "cybersecurity" && complexity === "complex") {
        return {
            model: MODELS.balanced,
            maxTokens: 1600,
            provider: "groq",
            reasoning: "Cybersecurity complex → 70B versatile",
        };
    }

    // Diagram → 70B
    if (needsDiagram) {
        return {
            model: MODELS.balanced,
            maxTokens: 1400,
            provider: "groq",
            reasoning: "Diagram requested → 70B versatile",
        };
    }

    // Complex → 70B
    if (complexity === "complex") {
        return {
            model: MODELS.balanced,
            maxTokens: 1400,
            provider: "groq",
            reasoning: "Complex reasoning → 70B versatile",
        };
    }

    // Medium → 70B  (was: llama-3.1-70b-versatile — decommissioned)
    if (complexity === "medium") {
        return {
            model: MODELS.balanced,
            maxTokens: ctx.answerType === "detailed" ? 900 : 500,
            provider: "groq",
            reasoning: "Medium complexity → 70B versatile",
        };
    }

    // Simple → 8B fast
    return {
        model: MODELS.fast,
        maxTokens: ctx.answerType === "short" ? 250 : 500,
        provider: "groq",
        reasoning: "Simple → 8B fast",
    };
}