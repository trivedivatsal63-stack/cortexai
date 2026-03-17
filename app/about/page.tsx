'use client'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white px-6 py-10">

            {/* 🔥 HERO SECTION */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-green-400">
                    ⚡ CyberAI
                </h1>
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                    Intelligent Cybersecurity Assistant for log analysis, ethical hacking guidance,
                    and real-world security learning.
                </p>

                <div className="mt-4 flex justify-center gap-3">
                    <span className="bg-green-900/40 text-green-400 px-3 py-1 rounded-lg text-sm">
                        v2.0
                    </span>
                    <span className="bg-orange-900/40 text-orange-400 px-3 py-1 rounded-lg text-sm">
                        Powered by Groq
                    </span>
                </div>
            </div>

            {/* 🧠 WHAT IS CYBERAI */}
            <section className="max-w-4xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-4">
                    What is CyberAI?
                </h2>
                <p className="text-gray-300 leading-relaxed">
                    CyberAI is an advanced AI-powered platform designed for cybersecurity
                    enthusiasts, students, and professionals. It helps analyze logs,
                    understand vulnerabilities, explore hacking tools, and learn complex
                    security concepts through an interactive and intelligent interface.
                </p>
            </section>

            {/* ⚙️ FEATURES */}
            <section className="max-w-5xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">
                    Core Features
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        {
                            title: '🔍 Log Analysis',
                            desc: 'Analyze logs, detect suspicious patterns, and get actionable fixes.',
                        },
                        {
                            title: '🐧 Kali Tools',
                            desc: 'Learn tools, commands, and real-world penetration testing workflows.',
                        },
                        {
                            title: '🐞 Bug Bounty',
                            desc: 'Understand recon, vulnerabilities, and reporting techniques.',
                        },
                        {
                            title: '💻 Script Help',
                            desc: 'Generate and debug Python/Bash scripts for cybersecurity tasks.',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-[#111827] border border-green-900/30 rounded-xl p-5 hover:border-green-500 transition"
                        >
                            <h3 className="text-lg font-semibold text-green-400 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-400 text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📚 KNOWLEDGE DOMAINS */}
            <section className="max-w-5xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-6 text-center">
                    Knowledge Domains
                </h2>

                <div className="flex flex-wrap justify-center gap-3">
                    {[
                        'Operating Systems',
                        'Networking',
                        'Web Security',
                        'Malware Analysis',
                        'Cryptography',
                        'Digital Forensics',
                        'Reverse Engineering',
                        'CTF & Practice',
                    ].map((item, i) => (
                        <span
                            key={i}
                            className="bg-green-900/30 text-green-400 px-4 py-2 rounded-lg text-sm"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </section>

            {/* 🧱 TECH STACK */}
            <section className="max-w-4xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-4">
                    Tech Stack
                </h2>
                <ul className="text-gray-300 space-y-2">
                    <li>⚡ Frontend: Next.js + Tailwind CSS</li>
                    <li>⚙️ Backend: API Routes</li>
                    <li>🧠 AI Model: Groq / Claude</li>
                    <li>🔍 Future: RAG + FAISS Vector Database</li>
                </ul>
            </section>

            {/* 🚀 VISION */}
            <section className="max-w-4xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-4">
                    Vision
                </h2>
                <p className="text-gray-300">
                    CyberAI aims to evolve into a specialized cybersecurity AI system that
                    combines real-world data, intelligent analysis, and interactive tools
                    to assist learners and professionals in solving real security
                    challenges.
                </p>
            </section>

            {/* 👨‍💻 DEVELOPER */}
            <section className="max-w-4xl mx-auto mb-12">
                <h2 className="text-2xl font-semibold text-green-400 mb-4">
                    Developer
                </h2>
                <p className="text-gray-300">
                    Built by <span className="text-green-400 font-semibold">Vatsal Trivedi</span>,
                    a BCA final-year student passionate about cybersecurity and AI.
                    Focused on building real-world intelligent systems and learning by doing.
                </p>
            </section>

            {/* 🔥 CTA */}
            <div className="text-center">
                <a
                    href="/"
                    className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl transition"
                >
                    🚀 Start Using CyberAI
                </a>
            </div>
        </div>
    )
}