type Complexity = "simple" | "medium" | "complex";
type Mode = "learning" | "cybersecurity" | "research";
type AnswerType = "short" | "detailed";

interface ModelConfig {
    id: string;
    provider: "groq";
    role: "fast" | "balanced" | "reasoning" | "long";
    maxTokens: number;
    description: string;
}

interface RouteDecision {
    model: string;
    maxTokens: number;
    provider: "groq";
    reasoning: string;
    confidence: number;
}

interface QueryContext {
    query: string;
    mode: Mode;
    answerType: AnswerType;
    examMode: boolean;
}

interface RoutingEntry {
    query: string;
    decision: RouteDecision;
    timestamp: number;
}

const MODELS: Record<string, ModelConfig> = {
    fast: {
        id: "llama-3.1-8b-instant",
        provider: "groq",
        role: "fast",
        maxTokens: 500,
        description: "Simple queries, exam mode, high throughput",
    },
    balanced: {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        provider: "groq",
        role: "balanced",
        maxTokens: 4096,
        description: "Medium complexity, general purpose — Llama 4 Scout",
    },
    reasoning: {
        id: "qwen/qwen3-32b",
        provider: "groq",
        role: "reasoning",
        maxTokens: 4096,
        description: "Complex reasoning, research, deep analysis — Qwen 3 32B",
    },
    long: {
        id: "llama-3.3-70b-versatile",
        provider: "groq",
        role: "long",
        maxTokens: 4096,
        description: "Long-form responses, learning, research — Llama 3.3 70B",
    },
};

const FALLBACK_CHAIN: Record<string, string[]> = {
    "llama-3.1-8b-instant": ["meta-llama/llama-4-scout-17b-16e-instruct"],
    "meta-llama/llama-4-scout-17b-16e-instruct": ["llama-3.3-70b-versatile", "qwen/qwen3-32b", "llama-3.1-8b-instant"],
    "qwen/qwen3-32b": ["llama-3.3-70b-versatile", "meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.1-8b-instant"],
    "llama-3.3-70b-versatile": ["qwen/qwen3-32b", "meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.1-8b-instant"],
};

const SIMPLE_SIGNALS = [
    /^what is /i, /^define /i, /^who is /i,
    /^full form/i, /^expand/i, /^meaning of/i,
    /^list /i, /^name /i,
];

const COMPLEX_SIGNALS = [
    /explain in detail/i, /how does .+ work/i,
    /compare/i, /difference between/i,
    /architecture/i, /step.by.step/i,
    /implement/i, /design/i, /analyze/i,
    /why does/i, /what causes/i, /derive/i,
    /prove/i, /theorem/i,
];

const DIAGRAM_SIGNALS = [
    /diagram/i, /flowchart/i, /draw/i,
    /visual/i, /architecture/i, /graph/i,
    /tree/i, /network/i,
];

function detectComplexity(query: string): Complexity {
    const words = query.split(/\s+/).length;
    if (words <= 4) return "simple";
    if (words >= 20) return "complex";

    const simpleScore = SIMPLE_SIGNALS.filter(p => p.test(query)).length;
    const complexScore = COMPLEX_SIGNALS.filter(p => p.test(query)).length;

    if (simpleScore > complexScore) return "simple";
    if (complexScore > simpleScore) return "complex";

    if (words >= 14) return "complex";
    if (words >= 8) return "medium";
    return "simple";
}

function calculateConfidence(ctx: QueryContext, complexity: Complexity): number {
    let confidence = 0.5;
    const wordCount = ctx.query.split(/\s+/).length;

    confidence += Math.min(wordCount / 50, 0.2);

    if (SIMPLE_SIGNALS.some(p => p.test(ctx.query))) confidence += 0.1;
    if (COMPLEX_SIGNALS.some(p => p.test(ctx.query))) confidence += 0.15;
    if (DIAGRAM_SIGNALS.some(p => p.test(ctx.query))) confidence += 0.1;

    if (ctx.examMode) confidence += 0.1;

    return Math.min(confidence, 1.0);
}

export function detectDiagramNeeded(query: string): boolean {
    return DIAGRAM_SIGNALS.some(p => p.test(query));
}

export function getFallbackChain(model: string): string[] {
    return FALLBACK_CHAIN[model] ?? [];
}

const routingHistory: RoutingEntry[] = [];
const MAX_HISTORY = 100;

export function getRoutingHistory(): RoutingEntry[] {
    return [...routingHistory];
}

export function clearRoutingHistory(): void {
    routingHistory.length = 0;
}

export function routeToModel(ctx: QueryContext): RouteDecision {
    const complexity = detectComplexity(ctx.query);
    const needsDiagram = detectDiagramNeeded(ctx.query);
    const confidence = calculateConfidence(ctx, complexity);

    let decision: RouteDecision;

    if (ctx.examMode) {
        decision = {
            model: MODELS.fast.id,
            maxTokens: ctx.answerType === "short" ? 200 : 400,
            provider: "groq",
            reasoning: `Exam mode → ${MODELS.fast.id}`,
            confidence,
        };
    } else if ((ctx.mode === 'learning' || ctx.mode === 'research') && complexity !== 'simple') {
        decision = {
            model: MODELS.long.id,
            maxTokens: MODELS.long.maxTokens,
            provider: "groq",
            reasoning: `${ctx.mode} medium+ → ${MODELS.long.id}`,
            confidence,
        };
    } else if (ctx.mode === "research" && complexity === "complex") {
        decision = {
            model: MODELS.reasoning.id,
            maxTokens: MODELS.reasoning.maxTokens,
            provider: "groq",
            reasoning: `Research + complex → ${MODELS.reasoning.id}`,
            confidence,
        };
    } else if (ctx.mode === "cybersecurity" && complexity === "complex") {
        decision = {
            model: MODELS.balanced.id,
            maxTokens: MODELS.balanced.maxTokens,
            provider: "groq",
            reasoning: `Security complex → ${MODELS.balanced.id}`,
            confidence,
        };
    } else if (needsDiagram) {
        decision = {
            model: MODELS.balanced.id,
            maxTokens: MODELS.balanced.maxTokens,
            provider: "groq",
            reasoning: `Diagram requested → ${MODELS.balanced.id}`,
            confidence,
        };
    } else if (complexity === "complex") {
        decision = {
            model: MODELS.balanced.id,
            maxTokens: MODELS.balanced.maxTokens,
            provider: "groq",
            reasoning: `Complex reasoning → ${MODELS.balanced.id}`,
            confidence,
        };
    } else if (complexity === "medium") {
        decision = {
            model: MODELS.balanced.id,
            maxTokens: ctx.answerType === "detailed" ? 900 : 500,
            provider: "groq",
            reasoning: `Medium complexity → ${MODELS.balanced.id}`,
            confidence,
        };
    } else {
        decision = {
            model: MODELS.fast.id,
            maxTokens: ctx.answerType === "short" ? 250 : 500,
            provider: "groq",
            reasoning: `Simple → ${MODELS.fast.id}`,
            confidence,
        };
    }

    // Domain-specific max_tokens: Learning/Research 4096, Security 2048
    if (ctx.mode === 'learning' || ctx.mode === 'research') {
        decision.maxTokens = Math.min(decision.maxTokens, 4096);
    } else if (ctx.mode === 'cybersecurity') {
        decision.maxTokens = Math.min(decision.maxTokens, 2048);
    }

    routingHistory.push({
        query: ctx.query.slice(0, 100),
        decision,
        timestamp: Date.now(),
    });

    if (routingHistory.length > MAX_HISTORY) {
        routingHistory.splice(0, routingHistory.length - MAX_HISTORY);
    }

    return decision;
}
