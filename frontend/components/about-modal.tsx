"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BrainCircuit, ShieldAlert, Award } from "lucide-react";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

export default function AboutModal({ isOpen, onClose, t }: AboutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="relative w-full max-w-2xl bg-[#090d16] border border-white/10 rounded-2xl overflow-hidden p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10"
                    >
                        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                                <Sparkles className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-white uppercase italic">
                                Zuk<span className="text-cyan-500">kO</span> —{" "}
                                {t("about_title")}
                            </h2>
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="text-cyan-400 mt-1">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-semibold text-white tracking-wide uppercase">
                                        {t("about_feature1_title")}
                                    </h3>
                                    <p className="mt-1 text-xs md:text-sm text-slate-400 leading-relaxed font-light">
                                        {t("about_feature1_desc")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="text-cyan-400 mt-1">
                                    <BrainCircuit className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-semibold text-white tracking-wide uppercase">
                                        {t("about_feature2_title")}
                                    </h3>
                                    <p className="mt-1 text-xs md:text-sm text-slate-400 leading-relaxed font-light">
                                        {t("about_feature2_desc")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                <div className="text-cyan-400 mt-1">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-semibold text-white tracking-wide uppercase">
                                        {t("about_feature3_title")}
                                    </h3>
                                    <p className="mt-1 text-xs md:text-sm text-slate-400 leading-relaxed font-light">
                                        {t("about_feature3_desc")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
