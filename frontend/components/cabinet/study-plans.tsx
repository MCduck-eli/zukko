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
        if (saved) setCompletedTasks(JSON.parse(saved));
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

    if (isLoading)
        return (
            <div className="text-white/40 text-center animate-pulse py-10">
                Signallar skanerlanmoqda...
            </div>
        );

    return (
        <div className="space-y-4">
            {plans.map((p) => {
                const lines = p.plan.split("\n");
                const tasks = lines.filter(
                    (line) =>
                        line.trim().startsWith("-") ||
                        line.trim().startsWith("*") ||
                        /^\d+\./.test(line.trim()),
                );

                const progress =
                    tasks.length > 0
                        ? Math.round(
                              ((completedTasks[p.id]?.length || 0) /
                                  tasks.length) *
                                  100,
                          )
                        : 0;

                return (
                    <div
                        key={p.id}
                        className={`w-full rounded-xl border overflow-hidden transition-all ${
                            !p.is_read
                                ? "bg-cyan-500/5 border-cyan-500/50"
                                : "bg-white/[0.02] border-white/5"
                        }`}
                    >
                        <div
                            className="p-4 cursor-pointer flex justify-between items-center hover:bg-white/[0.03]"
                            onClick={() => {
                                if (!p.is_read) onPlanOpen(p.id);
                                setSelectedPlan(
                                    selectedPlan?.id === p.id ? null : p,
                                );
                            }}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-cyan-400 uppercase tracking-wider">
                                        📬 {p.category}
                                    </span>
                                    {!p.is_read && (
                                        <span className="text-[8px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse uppercase">
                                            Yangi
                                        </span>
                                    )}
                                </div>
                                <div className="w-full max-w-[150px] h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-white/40 ml-2">
                                {progress}% bajarildi
                            </span>
                        </div>

                        <AnimatePresence>
                            {selectedPlan?.id === p.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-4 border-t border-white/10"
                                >
                                    <div className="pt-4 text-xs text-white/80 space-y-2">
                                        {tasks.length > 0 ? (
                                            tasks.map((task, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                    onClick={() =>
                                                        toggleTask(p.id, task)
                                                    }
                                                >
                                                    <div
                                                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${completedTasks[p.id]?.includes(task) ? "bg-cyan-500 border-cyan-500" : "border-white/30 group-hover:border-cyan-400"}`}
                                                    >
                                                        {completedTasks[
                                                            p.id
                                                        ]?.includes(task) &&
                                                            "✔"}
                                                    </div>
                                                    <span
                                                        className={`transition-all ${completedTasks[p.id]?.includes(task) ? "line-through text-white/30" : "text-white/80"}`}
                                                    >
                                                        {task
                                                            .replace(
                                                                /^[-*]|\d+\./,
                                                                "",
                                                            )
                                                            .trim()}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="prose prose-invert prose-xs">
                                                <ReactMarkdown>
                                                    {p.plan}
                                                </ReactMarkdown>
                                            </div>
                                        )}
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
