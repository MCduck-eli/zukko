"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Question {
    id: number;
    title: string;
    options: string[] | string;
    answer: string;
    category: string;
}

export default function TestPage() {
    const params = useParams();
    const router = useRouter();
    const subjectKey = (params.subject as string)?.toLowerCase();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subjectKey) return;
        fetch(`http://127.0.0.1:3001/api/questions?category=${subjectKey}`)
            .then((res) => {
                if (!res.ok)
                    throw new Error("Savollarni yuklashda xatolik yuz berdi");
                return res.json();
            })
            .then((data) => {
                setQuestions(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [subjectKey]);

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#0a0a0a] text-white p-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 text-orange-500">
                {subjectKey} Missiyasi
            </h1>
            {loading && (
                <p className="text-gray-400">Savollar yuklanmoqda...</p>
            )}
            {error && <p className="text-red-500">Xato: {error}</p>}
            {!loading && !error && (
                <div className="w-full max-w-2xl space-y-6">
                    {questions.length === 0 ? (
                        <p className="text-center text-gray-500">
                            Bu fan bo'yicha hozircha savollar yo'q.
                        </p>
                    ) : (
                        questions.map((q, index) => {
                            const parsedOptions: string[] =
                                typeof q.options === "string"
                                    ? JSON.parse(q.options)
                                    : q.options;

                            return (
                                <div
                                    key={q.id}
                                    className="p-6 bg-white/5 border border-white/10 rounded-xl"
                                >
                                    <h3 className="text-lg font-semibold mb-4">
                                        {index + 1}. {q.title}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {parsedOptions.map((option, optIdx) => (
                                            <button
                                                key={optIdx}
                                                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-sm"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <button
                className="mt-10 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-sm font-medium"
                onClick={() => router.back()}
            >
                ← Orqaga qaytish
            </button>
        </div>
    );
}
