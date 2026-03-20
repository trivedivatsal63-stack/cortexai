// lib/model-router.ts

type Complexity = "simple" | "medium" | "complex";
type Mode = "learning" | "cybersecurity";
type AnswerType = "short" | "detailed";

interface RouteDecision {
    model: string;
    maxTokens: number;
    provider: "groq" | "together" | "openrouter";
    reasoning: string;
}

interface QueryContext {
    query: string;
    mode: Mode;
    answerType: AnswerType;
    examMode: boolean;
}

// Keyword signals for complexity detection
const SIMPLE_SIGNALS = [
    /^what is /i, /^define /i, /^who is /i, /^what does .+ mean/i,
    /^full form of/i, /^expand /i, /^acronym/i,
];

const COMPLEX_SIGNALS = [
    /explain in detail/i, /how does .+ work/i, /compare .+ and/i,
    /difference between/i, /implement/i, /write (a|the) /i,
    /design/i, /architecture/i, /step.by.step/i, /with example/i,
];

const DIAGRAM_SIGNALS = [
    /diagram/i, /flowchart/i, /draw/i, /visualize/i,
    /show me/i, /architecture/i, /topology/i,
];

function detectComplexity(query: string): Complexity {
    const q = query.toLowerCase();

    // Word count heuristic
    const wordCount = q.split(/\s+/).length;
    if (wordCount <= 6) return "simple";
    if (wordCount >= 20) return "complex";

    // Keyword matching
    if (SIMPLE_SIGNALS.some(p => p.test(query))) return "simple";
    if (COMPLEX_SIGNALS.some(p => p.test(query))) return "complex";

    return "medium";
}

export function detectDiagramNeeded(query: string): boolean {
    return DIAGRAM_SIGNALS.some(p => p.test(query));
}

export function routeToModel(ctx: QueryContext): RouteDecision {
    const complexity = detectComplexity(ctx.query);
    const needsDiagram = detectDiagramNeeded(ctx.query);

    // Exam mode + simple → smallest model, very concise
    if (ctx.examMode && complexity === "simple") {
        return {
            model: "llama3-8b-8192",
            maxTokens: ctx.answerType === "short" ? 200 : 400,
            provider: "groq",
            reasoning: "Exam mode + simple query → fastest, cheapest model",
        };
    }

    // Cybersecurity mode always gets at least medium model
    if (ctx.mode === "cybersecurity" && complexity !== "simple") {
        return {
            model: "llama-3.1-70b-versatile",
            maxTokens: ctx.answerType === "detailed" ? 1200 : 600,
            provider: "groq",
            reasoning: "Cyber mode + medium/complex → Mixtral for accuracy",
        };
    }

    // Diagrams or complex explanations → 70B
    if (needsDiagram || complexity === "complex") {
        return {
            model: "llama-3.3-70b-versatile",
            maxTokens: ctx.answerType === "detailed" ? 2000 : 1000,
            provider: "groq",
            reasoning: "Complex/diagram query → 70B for depth",
        };
    }

    // Medium complexity → Mixtral
    if (complexity === "medium") {
        return {
            model: "mixtral-8x7b-32768",
            maxTokens: ctx.answerType === "detailed" ? 800 : 400,
            provider: "groq",
            reasoning: "Medium complexity → Mixtral balance",
        };
    }

    // Default: simple → 8B
    return {
        model: "llama-3.1-8b-instant",
        maxTokens: ctx.answerType === "short" ? 300 : 600,
        provider: "groq",
        reasoning: "Simple query → 8B fast and cheap",
    };
}