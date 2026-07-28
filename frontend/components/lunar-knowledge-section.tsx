"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    FaCheckCircle,
    FaRocket,
    FaUserGraduate,
    FaCrown,
} from "react-icons/fa";

export default function LunarLearningSection() {
    const { t } = useTranslation();
    const sectionRef = useRef(null);
    const steps = [
        {
            name: t("steps.step1.name"),
            status: t("steps.step1.status"),
            icon: <FaUserGraduate className="text-blue-400" />,
            features: t("steps.step1.features", {
                returnObjects: true,
            }) as string[],
            border: "border-blue-500/20",
        },
        {
            name: t("steps.step2.name"),
            status: t("steps.step2.status"),
            icon: <FaRocket className="text-purple-400" />,
            features: t("steps.step2.features", {
                returnObjects: true,
            }) as string[],
            border: "border-purple-500/40",
            popular: true,
        },
        {
            name: t("steps.step3.name"),
            status: t("steps.step3.status"),
            icon: <FaCrown className="text-orange-400" />,
            features: t("steps.step3.features", {
                returnObjects: true,
            }) as string[],
            border: "border-orange-500/20",
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[200vh] flex flex-col items-center justify-center overflow-hidden bg-[#020004] py-20"
        >
            <div className="relative z-30 container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                        {t("learning_title_1")}{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
                            {t("learning_title_2")}
                        </span>
                    </h2>
                    <p className="text-slate-400 mt-6 max-w-2xl mx-auto">
                        {t("learning_subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            className={`relative p-8 rounded-[2.5rem] border ${step.border} bg-black/60 backdrop-blur-md flex flex-col`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 text-3xl">
                                    {step.icon}
                                </div>
                                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full">
                                    {step.status}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6">
                                {step.name}
                            </h3>
                            <ul className="space-y-4 mb-10 grow">
                                {step.features.map((f, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 text-sm text-slate-300"
                                    >
                                        <FaCheckCircle className="text-orange-500 mt-1 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <div className="w-full py-4 rounded-xl bg-white/5 text-white/50 text-center font-bold border border-white/10">
                                {t("active_step")}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
