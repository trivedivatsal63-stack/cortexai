export { LEARNING_AGENT } from './learning';
export { RESEARCH_AGENT } from './research';
export { SECURITY_AGENT } from './security';

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
        systemPrompt: '',
    },
    research: {
        id: 'research',
        name: 'Research',
        icon: '🔎',
        description: 'Deep research, long-form answers, comparisons, reports',
        systemPrompt: '',
    },
    security: {
        id: 'security',
        name: 'Security',
        icon: '🛡️',
        description: 'Cybersecurity advisor, risk assessment, threat analysis',
        systemPrompt: '',
    },
};

import { LEARNING_AGENT } from './learning';
import { RESEARCH_AGENT } from './research';
import { SECURITY_AGENT } from './security';

AGENTS.learning.systemPrompt = LEARNING_AGENT.systemPrompt;
AGENTS.research.systemPrompt = RESEARCH_AGENT.systemPrompt;
AGENTS.security.systemPrompt = SECURITY_AGENT.systemPrompt;
