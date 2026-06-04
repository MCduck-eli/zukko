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

export default function LunarPricingSection() {
    const { t } = useTranslation();
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 50,
        damping: 20,
    });

    const starsY = useTransform(smoothProgress, [0, 1], ["0%", "-30%"]);
    const moonX = useTransform(smoothProgress, [0, 1], ["-100%", "100%"]);
    const moonY = useTransform(smoothProgress, [0, 1], ["10%", "-10%"]);
    const sunGlow = useTransform(
        smoothProgress,
        [0, 0.45, 0.5, 0.55, 1],
        [1, 1, 0.2, 1, 1],
    );
    const sunScale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1]);

    const StarField = useMemo(() => {
        const stars = Array.from({ length: 200 });
        return (
            <motion.div
                style={{ y: starsY }}
                className="absolute inset-0 z-0 pointer-events-none"
            >
                {stars.map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            width: Math.random() * 2 + "px",
                            height: Math.random() * 2 + "px",
                            left: Math.random() * 100 + "%",
                            top: Math.random() * 200 + "%",
                            opacity: Math.random() * 0.5 + 0.3,
                            willChange: "transform",
                        }}
                    />
                ))}
            </motion.div>
        );
    }, [starsY]);

    const plans = [
        {
            name: t("plan_1_name"),
            price: t("plan_1_price"),
            icon: <FaUserGraduate className="text-blue-400" />,
            features: t("plan_1_features", { returnObjects: true }) as string[],
            border: "border-blue-500/20",
            glow: "rgba(59, 130, 246, 0.3)",
        },
        {
            name: t("plan_2_name"),
            price: "49 000",
            icon: <FaRocket className="text-purple-400" />,
            features: t("plan_2_features", { returnObjects: true }) as string[],
            border: "border-purple-500/40",
            glow: "rgba(168, 85, 247, 0.4)",
            popular: true,
        },
        {
            name: t("plan_3_name"),
            price: "99 000",
            icon: <FaCrown className="text-orange-400" />,
            features: t("plan_3_features", { returnObjects: true }) as string[],
            border: "border-orange-500/20",
            glow: "rgba(249, 115, 22, 0.3)",
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[200vh] flex flex-col items-center justify-center overflow-hidden bg-[#020004] py-20"
        >
            {StarField}
            <motion.div
                style={{
                    opacity: sunGlow,
                    scale: sunScale,
                    willChange: "opacity, transform",
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            >
                <div className="w-80 h-80 md:w-120 md:h-120 rounded-full bg-orange-600 blur-[120px] opacity-20" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,white_0%,#f97316_30%,#7c2d12_70%,transparent_100%)] blur-sm" />
            </motion.div>
            <motion.div
                style={{ x: moonX, y: moonY, willChange: "transform" }}
                className="absolute w-62.5 h-62.5 md:w-125 md:h-125 z-20 pointer-events-none"
            >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_20%_20%,#94a3b8_0%,#1e293b_50%,#020004_100%)] shadow-2xl" />
            </motion.div>
            <div className="relative z-30 container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                        {t("pricing_title_1")}{" "}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
                            {t("pricing_title_2")}
                        </span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={`relative p-8 rounded-[2.5rem] border ${plan.border} bg-black/60 backdrop-blur-md flex flex-col`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 text-3xl">
                                    {plan.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">
                                        {plan.price}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase">
                                        {plan.price !== t("plan_1_price") &&
                                            `UZS / ${t("month")}`}
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-6">
                                {plan.name}
                            </h3>
                            <ul className="space-y-4 mb-10 grow">
                                {plan.features.map((f, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 text-sm text-slate-300"
                                    >
                                        <FaCheckCircle className="text-orange-500 mt-1 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-orange-500 hover:text-white transition-colors">
                                {t("start_mission")}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
