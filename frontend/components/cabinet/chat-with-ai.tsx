"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";

export default function ChatWithAI() {
    const { user } = useUser();
    const [messages, setMessages] = useState<{ role: string; text: string }[]>(
        () => {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("chat_history");
                const timestamp = localStorage.getItem("chat_timestamp");
                if (
                    saved &&
                    timestamp &&
                    Date.now() - parseInt(timestamp) < 2 * 60 * 60 * 1000
                ) {
                    return JSON.parse(saved);
                }
            }
            return [];
        },
    );
    useEffect(() => {
        if (messages.length === 0 && user?.firstName) {
            setMessages([
                {
                    role: "ai",
                    text: `Salom, ${user.firstName}! Men Zukko tizimining komandiriman. Tayyormisan? Koinot sirlarini va bilim cho'qqilarini birgalikda zabt etamiz! Qani, bugun nimalarni o'rganamiz?`,
                },
            ]);
        }
    }, [user, messages.length]);

    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        localStorage.setItem("chat_history", JSON.stringify(messages));
        localStorage.setItem("chat_timestamp", Date.now().toString());
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsThinking(true);

        try {
            const res = await fetch("http://localhost:3001/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!res.ok) throw new Error("Server xatosi");

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: "Tizimda xatolik! Kompyuterim ozgina qizib ketdi, qayta urinib ko'ring.",
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col h-full font-mono">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {messages.map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={`text-xs p-3 rounded-xl max-w-[85%] ${
                            m.role === "user"
                                ? "bg-cyan-500/20 ml-auto text-cyan-100"
                                : "bg-purple-900/30 mr-auto text-purple-100 border border-purple-500/20"
                        }`}
                    >
                        {m.text}
                    </motion.div>
                ))}
                {isThinking && (
                    <div className="text-[10px] text-white/30 animate-pulse">
                        Commander o'ylamoqda...
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500"
                    placeholder="Savol yoki hazil yozing..."
                />
                <button
                    onClick={sendMessage}
                    className="px-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs rounded-xl font-bold hover:opacity-80"
                >
                    🚀
                </button>
            </div>
        </div>
    );
}
