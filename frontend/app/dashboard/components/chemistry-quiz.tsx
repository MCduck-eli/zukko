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

interface ChemistryQuizProps {
    onClose: () => void;
}

export default function ChemistryQuiz({ onClose }: ChemistryQuizProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3001/api";
                const res = await fetch(
                    `${baseUrl}/questions?category=chemistry&limit=10`,
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
    const saveQuizResults = async (finalScore: number, finalWrongs: any[]) => {
        setIsSaving(true);
        const quizResultData = {
            category: "chemistry",
            score: finalScore,
            totalQuestions: questions.length,
            wrongAnswers: finalWrongs,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(
            "latest_quiz_result",
            JSON.stringify(quizResultData),
        );
        let userId = "1";
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                if (parsed.id) userId = parsed.id;
            } catch (e) {
                console.error("User parsing error:", e);
            }
        }
        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

            await fetch(`${baseUrl}/ai/study-plan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    category: "chemistry",
                    scoreText: `${finalScore}/${questions.length}`,
                    wrongAnswers: finalWrongs.length > 0 ? finalWrongs : [{ question: "Barchasi to'g'ri", userAnswer: "To'g'ri", correctAnswer: "To'g'ri" }],
                }),
            });
            console.log(
                "Natijalar kabinet tizimiga muvaffaqiyatli sinxronizatsiya qilindi.",
            );
        } catch (err) {
            console.error(
                "Backend'ga saqlashda xatolik:",
                err,
            );
        } finally {
            setIsSaving(false);
            window.dispatchEvent(new Event("storage"));
        }
    };

    const q = questions[currentIdx];
    const correctAnswerText = q ? q.answer || q.correctAnswer || "" : "";

    const handleAnswer = (selected: string) => {
        if (selectedAnswer !== null) return;

        const correct = selected === correctAnswerText;
        setSelectedAnswer(selected);

        let updatedScore = score;
        let updatedWrongs = [...wrongAnswers];

        if (correct) {
            updatedScore = score + 1;
            setScore(updatedScore);
        } else {
            updatedWrongs = [
                ...wrongAnswers,
                {
                    question: q.title,
                    userAnswer: selected,
                    correctAnswer: correctAnswerText,
                },
            ];
            setWrongAnswers(updatedWrongs);
        }

        setTimeout(() => {
            if (currentIdx + 1 < questions.length) {
                setCurrentIdx((prev) => prev + 1);
            } else {
                setShowResult(true);
                saveQuizResults(updatedScore, updatedWrongs);
            }
        }, 1000);
    };

    if (isLoading)
        return (
            <div className="text-white text-center py-10 animate-pulse font-medium">
                Kimyo savollari yuklanmoqda...
            </div>
        );

    if (!questions || questions.length === 0)
        return (
            <div className="text-white text-center py-10">
                Kimyo faniga oid savollar topilmadi.
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
                <h2 className="text-3xl font-black text-emerald-500 mb-4 uppercase tracking-tighter">
                    NATIJA: {percent}%
                </h2>
                <p className="text-white mb-6">
                    {questions.length} tadan {score} ta to'g'ri javob!
                </p>

                {isSaving ? (
                    <div className="w-full py-4 text-cyan-400 text-xs uppercase tracking-widest font-bold animate-pulse text-center mb-3">
                        ⚡ Natijalar Kabinetga sinxronizatsiya qilinmoqda...
                    </div>
                ) : (
                    <div className="w-full py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] rounded-xl uppercase tracking-wider font-bold text-center mb-4">
                        🚀 Natijalar Shaxsiy Kabinetga yuborildi!
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors uppercase tracking-wider mb-3"
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
                    className="bg-emerald-500 h-full"
                />
            </div>

            <div className="flex items-center justify-between mb-6">
                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    Kimyo Imtihoni
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
                            className={`w-full p-5 rounded-2xl border ${borderColor} ${bgColor} text-white text-left transition-all flex items-center gap-4 group ${selectedAnswer === null ? "hover:border-emerald-500/30 hover:bg-white/[0.05]" : ""}`}
                        >
                            <span
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] border transition-colors ${isThisSelected ? "bg-white text-black border-white" : "border-white/10 text-white/40 group-hover:border-emerald-500/30 group-hover:text-emerald-400"}`}
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
