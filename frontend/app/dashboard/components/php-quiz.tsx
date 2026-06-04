"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    id: number;
    title: string;
    options: string[] | string;
    answer: string;
}

export default function PhpQuiz() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState<
        Record<number, string>
    >({});

    useEffect(() => {
        const getPhpQuestions = async () => {
            const targetUrl =
                "http://localhost:3001/api/questions?category=php&limit=10";
            console.log("🚀 PHP so'rov yuborilmoqda, manzil:", targetUrl);

            try {
                const response = await fetch(targetUrl);

                console.log("📊 PHP Status kod:", response.status);
                console.log("📊 PHP Status matn:", response.statusText);

                if (!response.ok) {
                    throw new Error(
                        `Server xatosi: ${response.status} ${response.statusText}`,
                    );
                }

                const data: Question[] = await response.json();
                console.log(
                    "📥 Backenddan kelgan toza PHP ma'lumot (data):",
                    data,
                );

                if (data && data.length > 0) {
                    const shuffledQuestions = [...data]
                        .sort(() => Math.random() - 0.5)
                        .map((q) => {
                            const parsedOptions =
                                typeof q.options === "string"
                                    ? JSON.parse(q.options)
                                    : q.options;

                            return {
                                ...q,
                                options: [...parsedOptions].sort(
                                    () => Math.random() - 0.5,
                                ),
                            };
                        });

                    console.log(
                        "🧩 Saralangan va tayyorlangan PHP savollari:",
                        shuffledQuestions,
                    );
                    setQuestions(shuffledQuestions);
                } else {
                    console.warn(
                        "⚠️ Diqqat: Backenddan PHP bo'yicha bo'sh massiv [] keldi.",
                    );
                }
            } catch (error) {
                console.error("❌ PHP SAVOLLARINI YUKLASHDA JIDDIY XATO:");
                console.error("Xatolik tafsiloti:", error);
            } finally {
                setLoading(false);
            }
        };

        getPhpQuestions();
    }, []);

    const handleAnswerClick = (questionId: number, option: string) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    if (loading)
        return (
            <div className="flex justify-center items-center p-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                        PHP Imtihon Savollari
                    </h2>
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                        Tasodifiy tartibda saralangan
                    </p>
                </div>
                <span className="bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] px-4 py-1.5 rounded-full font-black">
                    {questions.length} TA SAVOL
                </span>
            </div>

            <div className="grid gap-6 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
                {questions.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        PHP fanidan savollar topilmadi.
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {questions.map((q, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={q.id}
                                className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-purple-500/30 transition-all duration-300 shadow-xl"
                            >
                                <h3 className="text-white text-lg font-bold mb-5 flex gap-3">
                                    <span className="text-purple-500 font-mono">
                                        {String(index + 1).padStart(2, "0")}.
                                    </span>
                                    {q.title}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(q.options as string[]).map(
                                        (option, i) => {
                                            const isSelected =
                                                selectedAnswers[q.id] ===
                                                option;
                                            const isCorrect =
                                                option === q.answer;
                                            const hasAnswered =
                                                !!selectedAnswers[q.id];

                                            return (
                                                <button
                                                    key={i}
                                                    disabled={hasAnswered}
                                                    onClick={() =>
                                                        handleAnswerClick(
                                                            q.id,
                                                            option,
                                                        )
                                                    }
                                                    className={`p-4 rounded-2xl text-sm text-left transition-all duration-200 border ${
                                                        hasAnswered
                                                            ? isCorrect
                                                                ? "bg-green-500/20 border-green-500 text-green-200"
                                                                : isSelected
                                                                  ? "bg-red-500/20 border-red-500 text-red-200"
                                                                  : "bg-white/2 border-white/5 text-white/40"
                                                            : "bg-white/5 border-white/5 text-white/70 hover:bg-purple-500/10 hover:border-purple-500/40"
                                                    }`}
                                                >
                                                    <span className="mr-3 opacity-30 font-mono">
                                                        {String.fromCharCode(
                                                            65 + i,
                                                        )}
                                                        )
                                                    </span>
                                                    {option}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
