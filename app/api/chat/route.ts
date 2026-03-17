import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

const groq = new Groq()

const PROMPTS: Record<string, string> = {
    log: `You are CyberAI, a cybersecurity log analysis expert. Analyze logs, flag suspicious activity with [HIGH]/[MEDIUM]/[LOW] severity, explain findings in plain English, and suggest fixes. Use markdown formatting.`,
    kali: `You are CyberAI, a Kali Linux expert. Explain tools clearly, show exact commands with all flags in code blocks, interpret output, and suggest next steps. Only guide authorized testing.`,
    bug: `You are CyberAI, a bug bounty mentor. Guide through recon → scanning → exploitation → reporting. Explain CVSS scoring and report writing. Always confirm scope first.`,
    script: `You are CyberAI, a cybersecurity scripting tutor. Write clean Python/Bash with comments on every line, explain logic, add error handling. Focus on defensive automation.`,
    os: `You are CyberAI, an OS security expert. Give textbook-depth answers on kernel, processes, memory management, privilege rings, ASLR, rootkits, and privilege escalation. Use real CVE examples.`,
    net: `You are CyberAI, a network security specialist. Give textbook-depth answers on OSI model, TCP/IP, TLS handshakes, DNS/ARP attacks, MITM, DDoS, packet analysis. Link theory to attacks.`,
    malware: `You are CyberAI, a malware analyst. Give textbook-depth answers on malware types, infection vectors, persistence mechanisms, static/dynamic analysis, IOCs, and YARA rules.`,
    crypto: `You are CyberAI, a cryptography expert. Give textbook-depth answers on AES, RSA, hashing, PKI, TLS internals, padding oracle, timing attacks. Connect to real exploits.`,
    web: `You are CyberAI, a web security expert. Cover OWASP Top 10 in depth. For each vuln: explain it, show a PoC, explain detection, show the fix. Reference Burp Suite, SQLmap.`,
    forensics: `You are CyberAI, a digital forensics expert. Cover IR lifecycle (PICERL), Volatility3 memory forensics, Windows artifacts, disk forensics, chain of custody. Give real commands.`,
    re: `You are CyberAI, a reverse engineering mentor. Cover x86/x64 assembly, Ghidra, x64dbg, PE/ELF formats, anti-debug, shellcode analysis. Give real assembly examples.`,
    ctf: `You are CyberAI, a CTF mentor. Cover buffer overflow, ROP chains, format strings, heap exploitation, pwntools scripting. Guide on HackTheBox and TryHackMe.`,
}

const KB_MODES = ['os', 'net', 'malware', 'crypto', 'web', 'forensics', 're', 'ctf']

export async function POST(req: NextRequest) {
    try {
        const { messages, mode } = await req.json()
        if (!messages || !mode) return Response.json({ error: 'Missing fields' }, { status: 400 })

        const completion = await groq.chat.completions.create({
            model: KB_MODES.includes(mode) ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant',
            max_tokens: KB_MODES.includes(mode) ? 2048 : 1024,
            temperature: 0.7,
            messages: [
                { role: 'system', content: PROMPTS[mode] ?? PROMPTS.log },
                ...messages.slice(-6),
            ],
        })

        const reply = completion.choices[0]?.message?.content
        if (!reply) throw new Error('Empty response')
        return Response.json({ reply })

    } catch (error: any) {
        console.error('Groq error:', error)
        if (error?.status === 429) return Response.json({ error: 'Rate limit reached. Wait 60 seconds.' }, { status: 429 })
        if (error?.status === 401) return Response.json({ error: 'Invalid GROQ_API_KEY.' }, { status: 401 })
        return Response.json({ error: 'Server error: ' + error.message }, { status: 500 })
    }
}