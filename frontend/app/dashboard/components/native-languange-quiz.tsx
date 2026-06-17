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

interface NativeLanguageQuizProps {
    onClose: () => void;
}

export default function NativeLanguageQuiz({
    onClose,
}: NativeLanguageQuizProps) {
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
                // Eslatma: Backenddagi kategoriya nomi bazadagi bilan bir xil bo'lishi shart
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3001/api";
                const res = await fetch(
                    `${baseUrl}/questions?category=native-language&limit=10`,
                );

                if (!res.ok) throw new Error("Tarmoq xatosi");

                const result = await res.json();
                const actualData = Array.isArray(result) ? result : result.data;

                if (actualData && Array.isArray(actualData)) {
                    setQuestions(actualData);
                }
            } catch (err) {
                console.error("Savollarni olishda xatolik:", err);
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
                console.error("Parse xatosi:", e);
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

        if (correct) setScore((prev) => prev + 1);

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
            <div className="text-white text-center py-10">
                Ona tili savollari yuklanmoqda...
            </div>
        );
    if (questions.length === 0)
        return (
            <div className="text-white text-center py-10">
                Savollar topilmadi.
            </div>
        );

    if (showResult) {
        const percent = Math.round((score / questions.length) * 100);
        return (
            <div className="text-center py-8">
                <h2 className="text-3xl font-black text-emerald-500 mb-4">
                    NATIJA: {percent}%
                </h2>
                <p className="text-white mb-6">
                    {questions.length} tadan {score} ta to'g'ri.
                </p>
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-emerald-500 text-black font-black rounded-xl"
                >
                    Qayta tanlash
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-white text-xl font-bold mb-10">{q.title}</h3>
            <div className="grid grid-cols-1 gap-3">
                {shuffledOptions.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-5 rounded-2xl border ${selectedAnswer === opt && opt === correctAnswerText ? "border-green-500 bg-green-500/10" : selectedAnswer === opt ? "border-red-500 bg-red-500/10" : "border-white/5 bg-white/[0.03]"} text-white text-left`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}
