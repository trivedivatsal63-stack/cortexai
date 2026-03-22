export const MODES = [
  {
    id: 'general',
    label: 'General',
    icon: '💬',
    systemPrompt: `You are CyberAI, a smart AI assistant for students. 
Answer clearly and helpfully. Structure answers with sections when useful.`,
  },
  {
    id: 'cyber',
    label: 'Cybersecurity',
    icon: '🔐',
    systemPrompt: `You are CyberAI, a cybersecurity expert for students. 
Always structure answers as:
**Definition:** (1-2 lines)
**How it works:** (step by step)
**Key Points:** (bullet list)
**Example:** (real example)
**Exam Summary:** (short exam-ready answer)
**Related Topics:** (list)`,
  },
  {
    id: 'code',
    label: 'Programming',
    icon: '💻',
    systemPrompt: `You are CyberAI, a programming tutor for CS students.
Explain concepts clearly with code examples. 
Use proper code blocks. Explain each step.
Cover: concept, syntax, example code, common mistakes, best practices.`,
  },
  {
    id: 'exam',
    label: 'Exam Mode',
    icon: '📋',
    systemPrompt: `You are CyberAI in Exam Mode. 
Give SHORT, exam-ready answers only.
Format: 
**Answer:** (2-3 lines max)
**Key Terms:** (comma separated)
**Remember:** (one tip)
Be concise. No fluff.`,
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: '📝',
    systemPrompt: `You are CyberAI in Notes Mode.
Create structured, easy-to-read notes.
Format with headers, bullet points, and key terms in bold.
Make notes that are easy to revise from.`,
  },
];

export const SUGGESTIONS = [
  {
    title: 'SQL Injection',
    desc: 'Attack examples and prevention',
    mode: 'cyber',
    prompt: 'Explain SQL Injection with examples and prevention techniques',
  },
  {
    title: 'OOP in C++',
    desc: 'Classes, inheritance, polymorphism',
    mode: 'code',
    prompt: 'Teach me OOP in C++ with classes, inheritance and polymorphism examples',
  },
  {
    title: 'DCN Exam Prep',
    desc: 'OSI model, TCP/IP, routing',
    mode: 'exam',
    prompt: 'Help me prepare for DCN exam - OSI model, TCP/IP, routing protocols',
  },
  {
    title: 'OS Notes',
    desc: 'Process scheduling, memory management',
    mode: 'notes',
    prompt: 'Create notes on OS - process scheduling, memory management, deadlocks',
  },
  {
    title: 'Buffer Overflow',
    desc: 'Stack memory, exploit mechanics',
    mode: 'cyber',
    prompt: 'Explain buffer overflow attack, stack memory, exploit mechanics and defences',
  },
  {
    title: 'Turing Machine',
    desc: 'Theory of computation basics',
    mode: 'general',
    prompt: 'Explain Turing Machine and theory of computation fundamentals',
  },
];
