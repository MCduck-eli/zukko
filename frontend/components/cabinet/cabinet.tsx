"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import StudyPlans from "./study-plans";
import ProgressTracker from "./progress.traker";

interface AiPlan {
    id: number;
    user_id: string;
    category: string;
    score: string;
    plan: string;
    is_read: boolean;
    created_at: string;
}

interface CabinetProps {
    isOpen: boolean;
    onClose: () => void;
}

const TabButton = ({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
            active
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "bg-white/5 text-white/40 hover:bg-white/10"
        }`}
    >
        {children}
    </button>
);

export default function Cabinet({ isOpen, onClose }: CabinetProps) {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState("plans");
    const [plans, setPlans] = useState<AiPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getUserId = () => {
        if (user?.id) return user.id;
        const localUserRaw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (localUserRaw) {
            try {
                const localUser = JSON.parse(localUserRaw);
                return localUser.id?.toString();
            } catch (e) {
                console.error("User parsing error:", e);
            }
        }
        return null;
    };

    const fetchPlans = async () => {
        const userId = getUserId();
        if (!userId) return;
        
        setIsLoading(true);
        const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        try {
            const res = await fetch(`${baseUrl}/ai/my-plans/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setPlans(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen, user?.id]);

    const markAsRead = async (planId: number) => {
        const plan = plans.find((p) => p.id === planId);
        if (plan && !plan.is_read) {
            const baseUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
            try {
                await fetch(`${baseUrl}/ai/mark-as-read/${planId}`, {
                    method: "PATCH",
                });
                setPlans((prev) =>
                    prev.map((p) =>
                        p.id === planId ? { ...p, is_read: true } : p,
                    ),
                );
            } catch (err) {
                console.error(err);
            }
        }
    };

    const sortedPlans = [...plans].sort(
        (a, b) => Number(b.is_read) - Number(a.is_read),
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={onClose} />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 200,
                        }}
                        className="relative w-full max-w-lg h-full bg-slate-950 border-l border-cyan-500/20 text-white p-6 shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                            <h2 className="text-xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                                KABINET: COMMANDER
                            </h2>
                            <button
                                onClick={onClose}
                                className="ml-auto text-white/60 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <TabButton
                                active={activeTab === "plans"}
                                onClick={() => setActiveTab("plans")}
                            >
                                Rejalar
                            </TabButton>
                            <TabButton
                                active={activeTab === "progress"}
                                onClick={() => setActiveTab("progress")}
                            >
                                Statistika
                            </TabButton>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {activeTab === "plans" && (
                                <StudyPlans
                                    plans={sortedPlans}
                                    isLoading={isLoading}
                                    onPlanOpen={markAsRead}
                                />
                            )}
                            {activeTab === "progress" && (
                                <ProgressTracker plans={plans} />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
