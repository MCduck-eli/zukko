"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface AiPlan {
    id: number;
    category: string;
    score: string;
    plan: string;
    is_read: boolean;
    created_at: string;
}

export default function StudyPlans({
    plans,
    isLoading,
    onPlanOpen,
}: {
    plans: AiPlan[];
    isLoading: boolean;
    onPlanOpen: (id: number) => void;
}) {
    const [selectedPlan, setSelectedPlan] = useState<AiPlan | null>(null);
    const [completedTasks, setCompletedTasks] = useState<
        Record<number, string[]>
    >({});

    useEffect(() => {
        const saved = localStorage.getItem("completed_tasks");
        if (saved) {
            try {
                setCompletedTasks(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const toggleTask = (planId: number, task: string) => {
        setCompletedTasks((prev) => {
            const planTasks = prev[planId] || [];
            const newTasks = planTasks.includes(task)
                ? planTasks.filter((t) => t !== task)
                : [...planTasks, task];
            const updated = { ...prev, [planId]: newTasks };
            localStorage.setItem("completed_tasks", JSON.stringify(updated));
            return updated;
        });
    };

    const extractTasks = (planText: string): string[] => {
        const lines = planText.split("\n");
        return lines
            .map((line) => line.trim())
            .filter((line) => {
                // Ignore dividers, horizontal rules, and status markers
                if (line.startsWith("---") || line.startsWith("___") || line.startsWith("***")) return false;
                if (line.startsWith("- ❌") || line.startsWith("- ✅") || line.startsWith("* ❌") || line.startsWith("* ✅")) return false;
                if (line === "-" || line === "*" || line.length < 4) return false;

                // Match checklist lines or bullet action points
                return (
                    line.startsWith("- [ ]") ||
                    line.startsWith("- [x]") ||
                    line.startsWith("* [ ]") ||
                    (line.startsWith("- ") && !line.startsWith("- **")) ||
                    /^\d+\.\s+[A-Za-zА-Яа-яЎўҚқҒғҲҳ]/.test(line)
                );
            })
            .map((line) =>
                line
                    .replace(/^-\s*\[[ x]\]\s*/i, "")
                    .replace(/^[-*]\s+/, "")
                    .replace(/^\d+\.\s+/, "")
                    .trim(),
            )
            .filter((task) => task.length > 2);
    };

    if (isLoading) {
        return (
            <div className="text-white/40 text-center animate-pulse py-10 text-xs uppercase tracking-widest font-mono">
                Rejalar yuklanmoqda...
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-sm font-bold text-white mb-1">
                    Hozircha o'quv rejalari yo'q
                </p>
                <p className="text-xs text-slate-400">
                    Testlarni topshiring, sun'iy intellekt xatolaringiz asosida bu yerda shaxsiy bosqichma-bosqich o'quv rejasini tuzib beradi.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {plans.map((p) => {
                const tasks = extractTasks(p.plan);
                const progress =
                    tasks.length > 0
                        ? Math.round(
                              ((completedTasks[p.id]?.length || 0) /
                                  tasks.length) *
                                  100,
                          )
                        : 0;

                const isOpened = selectedPlan?.id === p.id;

                return (
                    <div
                        key={p.id}
                        className={`w-full rounded-2xl border transition-all overflow-hidden ${
                            !p.is_read
                                ? "bg-orange-500/5 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]"
                                : "bg-white/[0.02] border-white/10 hover:border-white/20"
                        }`}
                    >
                        {/* Header Card */}
                        <div
                            className="p-5 cursor-pointer flex justify-between items-center hover:bg-white/[0.02] transition-colors"
                            onClick={() => {
                                if (!p.is_read) onPlanOpen(p.id);
                                setSelectedPlan(isOpened ? null : p);
                            }}
                        >
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className="font-bold text-sm text-white uppercase tracking-wider">
                                        📚 {p.category}
                                    </span>
                                    {!p.is_read && (
                                        <span className="text-[9px] font-black bg-orange-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Yangi
                                        </span>
                                    )}
                                    {p.score && (
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-orange-400 font-bold">
                                            Natija: {p.score}
                                        </span>
                                    )}
                                </div>

                                {tasks.length > 0 && (
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="w-full max-w-[140px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-slate-400">
                                            {progress}% bajarildi
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button className="text-xs text-orange-400 font-bold px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all shrink-0">
                                {isOpened ? "Yopish" : "Rejani ko'rish →"}
                            </button>
                        </div>

                        {/* Expandable Step-by-Step Plan Body */}
                        <AnimatePresence>
                            {isOpened && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="px-5 pb-6 pt-2 border-t border-white/5 bg-black/40 space-y-5"
                                >
                                    {/* Actionable Checkpoints */}
                                    {tasks.length > 0 && (
                                        <div className="space-y-3 mt-3">
                                            <h4 className="text-xs md:text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                                <span>✅</span>
                                                <span>Bajarilishi kerak bo'lgan vazifalar:</span>
                                            </h4>

                                            <div className="space-y-2.5">
                                                {tasks.map((task, idx) => {
                                                    const isDone = completedTasks[p.id]?.includes(task);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => toggleTask(p.id, task)}
                                                            className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                                                isDone
                                                                    ? "bg-white/[0.01] border-white/5 opacity-60"
                                                                    : "bg-white/[0.03] border-white/10 hover:border-orange-500/40 hover:bg-white/[0.06]"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                                                                    isDone
                                                                        ? "bg-orange-500 border-orange-500 text-black shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                                                                        : "border-white/30 text-transparent"
                                                                }`}
                                                            >
                                                                ✓
                                                            </div>
                                                            <div className="flex-1 text-[14px] md:text-[15px] leading-relaxed">
                                                                <span
                                                                    className={`${
                                                                        isDone
                                                                            ? "line-through text-slate-500"
                                                                            : "text-slate-100 font-medium"
                                                                    }`}
                                                                >
                                                                    {task}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Full Markdown Detailed View */}
                                    <div className="mt-6 pt-5 border-t border-white/10">
                                        <h4 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <span>📋</span>
                                            <span>Batafsil O'quv Yo'riqnomasi:</span>
                                        </h4>
                                        <div className="prose prose-invert max-w-none text-[14px] md:text-[15px] text-slate-200 leading-relaxed space-y-3 [&_h3]:text-base md:[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-orange-400 [&_h3]:mt-5 [&_h3]:mb-2.5 [&_h4]:text-sm md:[&_h4]:text-base [&_h4]:font-bold [&_h4]:text-amber-300 [&_h4]:mt-4 [&_h4]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:my-1.5 [&_li]:leading-relaxed [&_strong]:text-white [&_strong]:font-semibold [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-orange-300 [&_code]:font-mono [&_hr]:border-white/10 [&_hr]:my-4">
                                            <ReactMarkdown>{p.plan}</ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
