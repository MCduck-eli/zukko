"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
    id: number;
    title: string;
    options: string[];
    answer: string;
}

export default function PythonQuiz({
    subjectKey,
    onClose,
}: {
    subjectKey: string;
    onClose: () => void;
}) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        async function getPythonData() {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_PORT}/questions?subjectKey=${subjectKey}`,
                );
                const data = await response.json();

                let rawQuestions = data.questions || [];

                if (rawQuestions.length > 0) {
                    const randomized = [...rawQuestions].sort(
                        () => Math.random() - 0.5,
                    );
                    setQuestions(randomized.slice(0, 10));
                }
            } catch (err) {
                console.error("Xatolik:", err);
            } finally {
                setLoading(false);
            }
        }
        getPythonData();
    }, [subjectKey]);
    useEffect(() => {
        if (questions.length > 0 && questions[currentIdx]) {
            const options = [...questions[currentIdx].options];
            setShuffledOptions(options.sort(() => Math.random() - 0.5));
            setSelectedAnswer(null);
        }
    }, [questions, currentIdx]);

    const handleAnswer = (opt: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(opt);

        if (opt === questions[currentIdx].answer) {
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

    if (loading)
        return (
            <div className="text-white/50 text-center py-10 uppercase text-[10px] tracking-widest animate-pulse">
                Yuklanmoqda...
            </div>
        );

    if (questions.length === 0)
        return (
            <div className="text-center text-white/30 italic py-10">
                Savollar topilmadi.
            </div>
        );

    if (showResult) {
        return (
            <div className="text-center py-10">
                <h2 className="text-3xl font-black text-orange-500 mb-2">
                    {Math.round((score / questions.length) * 100)}%
                </h2>
                <p className="text-white/60 text-sm mb-6">
                    {questions.length} tadan {score} ta to'g'ri!
                </p>
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-xs font-bold uppercase transition-all"
                >
                    Yopish
                </button>
            </div>
        );
    }

    const q = questions[currentIdx];

    return (
        <div className="w-full space-y-6">
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{
                        width: `${((currentIdx + 1) / questions.length) * 100}%`,
                    }}
                    className="bg-orange-500 h-full shadow-[0_0_10px_#f97316]"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-white text-lg font-bold leading-relaxed">
                    {currentIdx + 1}. {q.title}
                </h3>

                <div className="grid grid-cols-1 gap-3">
                    {shuffledOptions.map((opt, i) => {
                        const isCorrect = opt === q.answer;
                        const isSelected = selectedAnswer === opt;

                        let stateClass =
                            "bg-white/5 border-white/5 hover:border-orange-500/30";
                        if (selectedAnswer) {
                            if (isCorrect)
                                stateClass =
                                    "bg-green-500/20 border-green-500 text-green-400";
                            else if (isSelected)
                                stateClass =
                                    "bg-red-500/20 border-red-500 text-red-400";
                            else
                                stateClass =
                                    "bg-white/2 border-white/5 opacity-30";
                        }

                        return (
                            <button
                                key={i}
                                disabled={!!selectedAnswer}
                                onClick={() => handleAnswer(opt)}
                                className={`p-4 rounded-2xl border text-left text-sm transition-all duration-300 ${stateClass}`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
