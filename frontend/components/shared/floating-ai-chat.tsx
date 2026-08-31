"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { 
    X, 
    Send, 
    RotateCcw, 
    Sparkles, 
    Bot, 
    User, 
    CheckCheck
} from "lucide-react";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

const QUICK_PROMPTS = [
    { text: "Platformada qanday fanlar bor?", lang: "uz" },
    { text: "AI qanday yordam bera oladi?", lang: "uz" },
    { text: "Какие курсы и тесты доступны?", lang: "ru" },
    { text: "Bog'lanish uchun raqam qoldirmoqchiman", lang: "uz" },
];

export default function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("zukko_floating_chat_history");
                const savedTime = localStorage.getItem("zukko_floating_chat_time");
                if (saved && savedTime && Date.now() - parseInt(savedTime) < 24 * 60 * 60 * 1000) {
                    return JSON.parse(saved);
                }
            } catch (e) {
                console.error("Failed to parse chat history:", e);
            }
        }
        return [
            {
                id: "welcome-1",
                role: "assistant",
                content: "Assalomu alaykum! Men **Zukko** ta'lim platformasining sun'iy intellekt konsultantiman. \n\nSizga qanday yordam bera olaman? Qiziqtirgan savollaringizni o'zbek yoki rus tilida bemalol berishingiz mumkin! ✨",
                timestamp: Date.now(),
            }
        ];
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Persist to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("zukko_floating_chat_history", JSON.stringify(messages));
            localStorage.setItem("zukko_floating_chat_time", Date.now().toString());
        }
    }, [messages]);

    // Auto scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isThinking, isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        }
    }, [isOpen]);

    const handleClearChat = () => {
        const initialMsg: ChatMessage = {
            id: "welcome-" + Date.now(),
            role: "assistant",
            content: "Suhbat yangilandi! Sizga qanday yordam bera olaman? / Чем я могу вам помочь?",
            timestamp: Date.now(),
        };
        setMessages([initialMsg]);
        if (typeof window !== "undefined") {
            localStorage.removeItem("zukko_floating_chat_history");
        }
    };

    const sendMessage = async (textToSend?: string) => {
        const query = (textToSend || input).trim();
        if (!query || isThinking) return;

        const userMsg: ChatMessage = {
            id: "user-" + Date.now(),
            role: "user",
            content: query,
            timestamp: Date.now(),
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsThinking(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
            
            // Format history for backend
            const historyPayload = updatedMessages.slice(-8).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch(`${baseUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: query,
                    history: historyPayload,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.reply || data.message || "Xatolik yuz berdi");
            }

            const aiReply = data.reply || "Kechirasiz, javob olishda xatolik yuz berdi.";

            setMessages((prev) => [
                ...prev,
                {
                    id: "ai-" + Date.now(),
                    role: "assistant",
                    content: aiReply,
                    timestamp: Date.now(),
                },
            ]);

            if (!isOpen) {
                setHasUnread(true);
            }
        } catch (error: unknown) {
            console.error("AI Chat Error:", error);
            const errMsg = error instanceof Error ? error.message : String(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: "ai-err-" + Date.now(),
                    role: "assistant",
                    content: errMsg.includes("GROQ_API_KEY")
                        ? "⚠️ AI xizmati sozlanmagan. Iltimos, administrator bilan bog'laning."
                        : "Kechirasiz, tarmoqda xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
                    timestamp: Date.now(),
                },
            ]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <>
            {/* FLOATING TRIGGER BUTTON */}
            <div className="fixed bottom-6 right-6 z-50 select-none">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="relative group"
                        >
                            {/* Floating hint pill */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="hidden sm:flex absolute right-16 top-1/2 -translate-y-1/2 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-[11px] text-cyan-300 font-medium whitespace-nowrap shadow-lg backdrop-blur-md pointer-events-none group-hover:border-cyan-400"
                            >
                                <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "4s" }} />
                                <span>AI Konsultant</span>
                            </motion.div>

                            {/* Main orb trigger */}
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => setIsOpen(true)}
                                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.8)] transition-all cursor-pointer overflow-hidden border border-white/20"
                                aria-label="AI Chatni ochish"
                            >
                                {/* Glowing backdrop pulse */}
                                <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20" />
                                
                                <Bot className="w-7 h-7 relative z-10 text-white group-hover:rotate-12 transition-transform duration-300" />

                                {hasUnread && (
                                    <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-bounce" />
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FLOATING CHAT MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-3 bottom-3 top-16 sm:top-auto sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] z-50 flex flex-col bg-[#0b0f19]/95 border border-cyan-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-2xl overflow-hidden font-sans"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-purple-950/60 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-white/20">
                                    <Bot className="w-5 h-5 text-white" />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-bold text-white tracking-wide">Zukko AI</h3>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                            Online
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/50 font-medium">Aqlli maslahatchi • UZ / RU</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleClearChat}
                                    title="Suhbatni tozalash"
                                    className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Yopish"
                                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* MESSAGES LIST */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-2.5 ${
                                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                                            m.role === "user"
                                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                        }`}
                                    >
                                        {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                        className={`max-w-[82%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                                            m.role === "user"
                                                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-medium rounded-br-xs shadow-[0_2px_10px_rgba(249,115,22,0.2)]"
                                                : "bg-white/[0.06] text-gray-100 border border-white/10 rounded-bl-xs backdrop-blur-md [&_p]:m-0 [&_p+p]:mt-2 [&_strong]:text-cyan-300 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_li]:my-0.5 [&_a]:text-cyan-400 [&_a]:underline"
                                        }`}
                                    >
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                        <div
                                            className={`text-[9px] mt-1.5 flex items-center gap-1 ${
                                                m.role === "user" ? "text-slate-800 justify-end" : "text-white/30 justify-start"
                                            }`}
                                        >
                                            <span>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            {m.role === "user" && <CheckCheck className="w-3 h-3 text-slate-800" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing Indicator */}
                            {isThinking && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-xs text-cyan-400/80 bg-white/[0.04] border border-cyan-500/20 px-3.5 py-2.5 rounded-2xl rounded-bl-xs w-fit"
                                >
                                    <Bot className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} />
                                    <span className="text-[11px] font-medium tracking-wide">Zukko AI javob yozmoqda</span>
                                    <span className="flex gap-1 items-center ml-1">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </span>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* QUICK PROMPT CHIPS */}
                        {messages.length <= 3 && !isThinking && (
                            <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                                {QUICK_PROMPTS.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(prompt.text)}
                                        className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-white/70 hover:text-cyan-300 transition-all cursor-pointer shrink-0"
                                    >
                                        {prompt.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* INPUT FOOTER */}
                        <div className="p-3.5 bg-slate-950/90 border-t border-white/10 shrink-0">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    sendMessage();
                                }}
                                className="flex items-center gap-2 bg-white/[0.05] border border-white/10 focus-within:border-cyan-500/60 rounded-2xl p-1.5 pl-3.5 transition-all shadow-inner"
                            >
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Savolingizni yozing..."
                                    disabled={isThinking}
                                    className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
                                />

                                <button
                                    type="submit"
                                    disabled={!input.trim() || isThinking}
                                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-cyan-500/20"
                                >
                                    <Send className="w-4 h-4 text-slate-950" />
                                </button>
                            </form>
                            <div className="flex items-center justify-between mt-2 px-1 text-[9px] text-white/30 font-medium">
                                <span>AI bilan bepul muloqot</span>
                                <span>Enter orqali yuborish</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
