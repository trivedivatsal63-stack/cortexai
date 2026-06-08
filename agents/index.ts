import { LEARNING_AGENT } from './learning';
import { RESEARCH_AGENT } from './research';
import { SECURITY_AGENT } from './security';

export type Agent = 'learning' | 'research' | 'security';

export interface AgentInfo {
    id: Agent;
    name: string;
    icon: string;
    description: string;
    systemPrompt: string;
}

export const AGENTS: Record<Agent, AgentInfo> = {
    learning: {
        id: 'learning',
        name: 'Learning',
        icon: '🧠',
        description: 'Teaching, step-by-step explanations, beginner friendly',
        systemPrompt: LEARNING_AGENT.systemPrompt,
    },
    research: {
        id: 'research',
        name: 'Research',
        icon: '🔎',
        description: 'Deep research, long-form answers, comparisons, reports',
        systemPrompt: RESEARCH_AGENT.systemPrompt,
    },
    security: {
        id: 'security',
        name: 'Security',
        icon: '🛡️',
        description: 'Cybersecurity advisor, risk assessment, threat analysis',
        systemPrompt: SECURITY_AGENT.systemPrompt,
    },
};

export { LEARNING_AGENT, RESEARCH_AGENT, SECURITY_AGENT };
