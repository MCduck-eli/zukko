"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    id: number;
    title: string;
    options: string[];
    answer: string;
    category: string;
}

interface QuizProps {
    subjectKey: string;
    onClose: () => void;
}

export default function QuizComponent({ subjectKey, onClose }: QuizProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3001/api";
                const res = await fetch(
                    `${baseUrl}/questions?category=${subjectKey}&limit=10`,
                );
                if (!res.ok) throw new Error("Tarmoq xatosi");
                const result = await res.json();
                if (result && Array.isArray(result.data)) {
                    setQuestions(result.data);
                }
            } catch (err) {
                console.error("Xatolik:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [subjectKey]);

    useEffect(() => {
        if (questions && questions[currentIdx]) {
            const options = [...questions[currentIdx].options];
            setShuffledOptions(options.sort(() => Math.random() - 0.5));
            setSelectedAnswer(null);
            setIsCorrect(null);
        }
    }, [questions, currentIdx]);

    const handleAnswer = (selected: string) => {
        if (selectedAnswer !== null) return;

        const correct = selected === questions[currentIdx].answer;
        setSelectedAnswer(selected);
        setIsCorrect(correct);

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
            <div className="text-white text-center py-10 animate-pulse">
                Yuklanmoqda...
            </div>
        );
    if (!questions || questions.length === 0)
        return (
            <div className="text-white text-center py-10">
                Savollar topilmadi.
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
                <h2 className="text-3xl font-black text-orange-500 mb-4">
                    NATIJA: {percent}%
                </h2>
                <p className="text-white mb-6">
                    {questions.length} tadan {score} ta to'g'ri!
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-orange-500 text-black font-black rounded-xl"
                >
                    Qayta tanlash
                </button>
            </motion.div>
        );
    }

    const q = questions[currentIdx];
    const labels = ["A", "B", "C", "D"];

    return (
        <div className="w-full">
            <div className="w-full bg-white/5 h-1 mb-6 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                    className="bg-orange-500 h-full"
                />
            </div>

            <h3 className="text-white text-xl font-bold mb-10">{q.title}</h3>

            <div className="grid grid-cols-1 gap-3">
                {shuffledOptions.map((opt, i) => {
                    const isThisSelected = selectedAnswer === opt;
                    const isThisCorrect = opt === q.answer;
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
                            className={`w-full p-5 rounded-2xl border ${borderColor} ${bgColor} text-white text-left transition-all flex items-center gap-4 group`}
                        >
                            <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] border ${isThisSelected ? "bg-white text-black" : "border-white/10 text-white/40"}`}
                            >
                                {labels[i]}
                            </span>
                            <span className="flex-1">{opt}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
