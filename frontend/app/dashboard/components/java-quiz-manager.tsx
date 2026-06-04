"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Question {
    id: number;
    title: string;
    options: string[];
    answer: string;
    category: string;
}

interface JavaQuizManagerProps {
    subjectKey: string;
    onClose: () => void;
}

export default function JavaQuizManager({
    subjectKey,
    onClose,
}: JavaQuizManagerProps) {
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
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(
                    `${baseUrl}/questions?category=${subjectKey}&limit=10`,
                );
                if (!res.ok) throw new Error("Tarmoq xatosi");
                const result = await res.json();

                if (result && Array.isArray(result.data)) {
                    const shuffled = [...result.data].sort(
                        () => Math.random() - 0.5,
                    );
                    setQuestions(shuffled);
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
        }
    }, [questions, currentIdx]);

    const handleAnswer = (selected: string) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(selected);

        if (selected === questions[currentIdx].answer) {
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
            <div className="text-white text-center py-10 animate-pulse uppercase text-xs tracking-widest">
                Savollar yuklanmoqda...
            </div>
        );
    if (questions.length === 0)
        return (
            <div className="text-white text-center py-10 opacity-40">
                Savollar topilmadi.
            </div>
        );

    if (showResult) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 bg-white/5 rounded-3xl border border-white/10 p-10"
            >
                <h2 className="text-4xl font-black text-orange-500 mb-2">
                    {Math.round((score / questions.length) * 100)}%
                </h2>
                <p className="text-white/60 mb-8 uppercase text-[10px] tracking-widest">
                    To'g'ri javoblar: {score} / {questions.length}
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-orange-500 text-black font-black rounded-2xl hover:bg-orange-400 transition-all"
                >
                    YANGI TEST
                </button>
            </motion.div>
        );
    }

    const q = questions[currentIdx];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4 text-[10px] text-white/40 font-bold tracking-widest uppercase">
                <span>
                    Savol {currentIdx + 1} / {questions.length}
                </span>
                <span className="text-orange-500">Ball: {score}</span>
            </div>
            <div className="w-full bg-white/5 h-1 mb-8 rounded-full overflow-hidden">
                <motion.div
                    animate={{
                        width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                    className="bg-orange-500 h-full"
                />
            </div>

            <h3 className="text-white text-xl font-bold mb-10 leading-tight">
                {q.title}
            </h3>

            <div className="grid grid-cols-1 gap-3">
                {shuffledOptions.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === q.answer;

                    let btnStyle = "border-white/5 bg-white/[0.03]";
                    if (selectedAnswer) {
                        if (isCorrect)
                            btnStyle =
                                "border-green-500 bg-green-500/20 text-green-400";
                        else if (isSelected)
                            btnStyle =
                                "border-red-500 bg-red-500/20 text-red-400";
                        else
                            btnStyle =
                                "border-white/5 bg-white/[0.01] opacity-30";
                    }

                    return (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            disabled={!!selectedAnswer}
                            className={`w-full p-5 rounded-2xl border ${btnStyle} text-white text-left transition-all flex items-center gap-4`}
                        >
                            <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold">
                                {String.fromCharCode(65 + i)}
                            </span>
                            <span className="text-sm">{opt}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
