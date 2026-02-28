"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./AiChat.module.css";

interface Message { role: "user" | "bot"; text: string; }

export default function AiChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", text: "👋 Namaste! I'm SeedsCo AI Assistant. Ask me anything about seeds, pricing, seasons, or ordering!" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setLoading(true);
        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "bot", text: data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const quickQuestions = [
        "What seeds for Punjab Rabi?",
        "What is MOQ?",
        "How to register?",
        "Germination guarantee?",
    ];

    return (
        <>
            {/* Floating Button */}
            <button className={`${styles.fab} ${open ? styles.fabOpen : ""}`} onClick={() => setOpen(!open)} aria-label="AI Chat">
                {open ? "✕" : "🤖"}
                {!open && <div className={styles.fabBadge}>AI</div>}
                <div className={styles.fabPulse}></div>
            </button>

            {/* Chat Panel */}
            {open && (
                <div className={styles.chatPanel}>
                    <div className={styles.chatHeader}>
                        <div className={styles.headerBot}>
                            <div className={styles.botAvatar}>🤖</div>
                            <div>
                                <div className={styles.botName}>SeedsCo AI</div>
                                <div className={styles.botStatus}>● Online — Rule-based Assistant</div>
                            </div>
                        </div>
                        <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((m, i) => (
                            <div key={i} className={`${styles.message} ${m.role === "user" ? styles.messageUser : styles.messageBot}`}>
                                {m.role === "bot" && <div className={styles.msgAvatar}>🌱</div>}
                                <div className={`${styles.msgBubble} ${m.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}>
                                    {m.text.split("\n").map((line, j) => (
                                        <p key={j} style={{ margin: j > 0 ? "0.15rem 0 0" : "0" }}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={styles.message}>
                                <div className={styles.msgAvatar}>🌱</div>
                                <div className={styles.typingIndicator}>
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length === 1 && (
                        <div className={styles.quickQuestions}>
                            {quickQuestions.map(q => (
                                <button key={q} className={styles.quickBtn} onClick={() => { setInput(q); }}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.chatInput}>
                        <input
                            className={styles.inputField}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                            placeholder="Ask about seeds, pricing, seasons..."
                            disabled={loading}
                        />
                        <button className={styles.sendBtn} onClick={sendMessage} disabled={loading || !input.trim()}>
                            {loading ? "⏳" : "➤"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
