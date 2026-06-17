"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Question {
    id: number;
    title: string;
    options: string[] | string;
    answer?: string;
    correctAnswer?: string;
    category: string;
}

interface PhysicsQuizProps {
    onClose: () => void;
}

export default function PhysicsQuiz({ onClose }: PhysicsQuizProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3001/api";
                const res = await fetch(
                    `${baseUrl}/questions?category=physics&limit=10`,
                );
                if (!res.ok) throw new Error("Tarmoq xatosi");

                const result = await res.json();
                const actualData = Array.isArray(result) ? result : result.data;

                if (actualData && Array.isArray(actualData)) {
                    setQuestions(actualData);
                }
            } catch (err) {
                console.error("Xatolik:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questions && questions[currentIdx]) {
            const currentQuestion = questions[currentIdx];
            let rawOptions: string[] = [];
            try {
                if (typeof currentQuestion.options === "string") {
                    rawOptions = JSON.parse(currentQuestion.options);
                } else if (Array.isArray(currentQuestion.options)) {
                    rawOptions = currentQuestion.options;
                }
            } catch (e) {
                console.error(e);
                rawOptions = [];
            }

            const options = [...rawOptions];
            setShuffledOptions(options.sort(() => Math.random() - 0.5));
            setSelectedAnswer(null);
        }
    }, [questions, currentIdx]);

    const q = questions[currentIdx];
    const correctAnswerText = q ? q.answer || q.correctAnswer || "" : "";

    const handleAnswer = (selected: string) => {
        if (selectedAnswer !== null) return;

        const correct = selected === correctAnswerText;
        setSelectedAnswer(selected);

        if (correct) {
            setScore((prev) => prev + 1);
        }
        setTimeout(() => {
            if (currentIdx + 1 < questions.length) {
                setCurrentIdx((prev) => prev + 1);
            } else {
                setShowResult(true);
            }
        }, 1000);
    };

    if (isLoading)
        return (
            <div className="text-white text-center py-10 animate-pulse font-medium">
                Fizika savollari yuklanmoqda...
            </div>
        );

    if (!questions || questions.length === 0)
        return (
            <div className="text-white text-center py-10">
                Fizika faniga oid savollar topilmadi.
            </div>
        );

    if (showResult) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
            >
                <h2 className="text-3xl font-black text-purple-500 mb-4 uppercase tracking-tighter">
                    NATIJA: {percent}%
                </h2>
                <p className="text-white mb-6">
                    {questions.length} tadan {score} ta to'g'ri javob!
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-purple-500 text-black font-black rounded-xl hover:bg-purple-400 transition-colors uppercase tracking-wider"
                >
                    Qayta tanlash
                </button>
            </motion.div>
        );
    }

    const labels = ["A", "B", "C", "D"];

    return (
        <div className="w-full">
            <div className="w-full bg-white/5 h-1 mb-6 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                    className="bg-purple-500 h-full"
                />
            </div>

            <div className="flex items-center justify-between mb-6">
                <span className="text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                    Fizika Imtihoni
                </span>
                <span className="text-white/40 text-xs font-mono">
                    {currentIdx + 1} / {questions.length}
                </span>
            </div>

            <h3 className="text-white text-xl font-bold mb-10 leading-relaxed">
                {q.title}
            </h3>

            <div className="grid grid-cols-1 gap-3">
                {shuffledOptions.map((opt, i) => {
                    const isThisSelected = selectedAnswer === opt;
                    const isThisCorrect = opt === correctAnswerText;
                    let borderColor = "border-white/5";
                    let bgColor = "bg-white/[0.03]";

                    if (selectedAnswer !== null) {
                        if (isThisCorrect) {
                            borderColor = "border-green-500";
                            bgColor = "bg-green-500/10";
                        } else if (isThisSelected && !isThisCorrect) {
                            borderColor = "border-red-500";
                            bgColor = "bg-red-500/10";
                        }
                    }

                    return (
                        <motion.button
                            key={`${currentIdx}-${i}`}
                            onClick={() => handleAnswer(opt)}
                            disabled={selectedAnswer !== null}
                            className={`w-full p-5 rounded-2xl border ${borderColor} ${bgColor} text-white text-left transition-all flex items-center gap-4 group ${selectedAnswer === null ? "hover:border-purple-500/30 hover:bg-white/[0.05]" : ""}`}
                        >
                            <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] border transition-colors ${isThisSelected ? "bg-white text-black border-white" : "border-white/10 text-white/40 group-hover:border-purple-500/30 group-hover:text-purple-400"}`}
                            >
                                {labels[i]}
                            </span>
                            <span className="flex-1 text-sm md:text-base">
                                {opt}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
