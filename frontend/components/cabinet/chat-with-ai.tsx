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
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
            const res = await fetch(`${baseUrl}/chat`, {
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
                        className={`text-[14.5px] md:text-[15px] p-4 rounded-2xl max-w-[85%] leading-relaxed shadow-sm ${
                            m.role === "user"
                                ? "bg-orange-500 text-black font-medium ml-auto rounded-tr-sm"
                                : "bg-white/10 text-gray-100 border border-white/10 mr-auto rounded-tl-sm backdrop-blur-md"
                        }`}
                    >
                        {m.text}
                    </motion.div>
                ))}
                {isThinking && (
                    <div className="text-xs text-orange-400/70 animate-pulse font-sans">
                        Zukko AI javob tayyorlamoqda...
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Savolingizni yozing..."
                    disabled={isThinking}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm md:text-[14.5px] text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <button
                    onClick={sendMessage}
                    disabled={isThinking}
                    className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-xl text-xs md:text-sm transition-colors cursor-pointer"
                >
                    Yuborish
                </button>
            </div>
        </div>
    );
}
