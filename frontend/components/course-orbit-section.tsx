"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    FaMicroscope,
    FaPalette,
    FaCalculator,
    FaGlobeAmericas,
    FaBriefcase,
    FaGraduationCap,
    FaMusic,
    FaDna,
} from "react-icons/fa";
import { MdLanguage, MdOutlinePsychology } from "react-icons/md";

export default function CourseOrbitSection() {
    const { t } = useTranslation();
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    const starsY = useTransform(smoothProgress, [0, 1], ["0%", "-50%"]);
    const planetY = useTransform(smoothProgress, [0, 1], ["15%", "-15%"]);
    const contentY = useTransform(smoothProgress, [0, 1], ["40px", "-40px"]);
    const sectionOpacity = useTransform(
        smoothProgress,
        [0, 0.2, 0.8, 1],
        [0, 1, 1, 0],
    );

    const stars = useMemo(() => Array.from({ length: 400 }), []);

    const courseLogos = [
        { icon: <FaMicroscope />, color: "#4ade80" },
        { icon: <FaPalette />, color: "#f472b6" },
        { icon: <FaCalculator />, color: "#60a5fa" },
        { icon: <FaGlobeAmericas />, color: "#34d399" },
        { icon: <FaBriefcase />, color: "#fbbf24" },
        { icon: <FaGraduationCap />, color: "#a78bfa" },
        { icon: <FaMusic />, color: "#f87171" },
        { icon: <FaDna />, color: "#2dd4bf" },
        { icon: <MdLanguage />, color: "#38bdf8" },
        { icon: <MdOutlinePsychology />, color: "#fb923c" },
    ];

    const getRand = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        const val = x - Math.floor(x);
        return Number(val.toFixed(4));
    };

    const floatingElements = useMemo(() => {
        return courseLogos.map((logo, i) => ({
            ...logo,
            top: `${(getRand(i) * 70 + 15).toFixed(2)}%`,
            left: `${(getRand(i + 10) * 80 + 10).toFixed(2)}%`,
            moveX: [0, Number((getRand(i + 20) * 50 - 25).toFixed(2)), 0],
            moveY: [0, Number((getRand(i + 30) * 50 - 25).toFixed(2)), 0],
            duration: Number((15 + getRand(i + 40) * 10).toFixed(2)),
        }));
    }, []);

    return (
        <motion.section
            ref={sectionRef}
            style={{ opacity: sectionOpacity }}
            className="relative min-h-[160vh] flex items-center justify-center overflow-hidden bg-[#030005]"
        >
            <motion.div style={{ y: starsY }} className="absolute inset-0 z-0">
                {stars.map((_, i) => {
                    const width = (getRand(i) * 2 + 0.5).toFixed(2);
                    const height = (getRand(i + 200) * 2 + 0.5).toFixed(2);
                    const left = (getRand(i + 400) * 100).toFixed(2);
                    const top = (getRand(i + 600) * 200).toFixed(2);
                    const opacity = (getRand(i + 800) * 0.7 + 0.3).toFixed(2);

                    return (
                        <div
                            key={i}
                            suppressHydrationWarning
                            className="absolute bg-white rounded-full"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                left: `${left}%`,
                                top: `${top}%`,
                                opacity: Number(opacity),
                            }}
                        />
                    );
                })}
            </motion.div>
            <motion.div
                style={{ y: planetY }}
                className="absolute w-100 h-100 md:w-175 md:h-175 z-10 pointer-events-none"
            >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#ef4444_0%,#7f1d1d_60%,#030005_100%)] shadow-[0_0_120px_rgba(239,68,68,0.2)] opacity-80" />
                <div className="absolute -inset-20 rounded-full bg-red-600/10 blur-[150px]" />
            </motion.div>
            <div className="absolute inset-0 z-20 pointer-events-none">
                {floatingElements.map((item, i) => (
                    <motion.div
                        key={i}
                        suppressHydrationWarning
                        className="absolute"
                        style={{ top: item.top, left: item.left }}
                        animate={{
                            x: item.moveX,
                            y: item.moveY,
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: item.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <div className="relative p-5 rounded-2xl bg-white/3 border border-white/10 backdrop-blur-md group transition-all duration-1000">
                            <div
                                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                                style={{ backgroundColor: item.color }}
                            />
                            <div
                                className="relative z-10 text-2xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all"
                                style={{ color: item.color }}
                            >
                                {item.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <motion.div
                style={{ y: contentY }}
                className="relative z-30 container mx-auto px-6 text-center"
            >
                <motion.div className="max-w-2xl mx-auto space-y-12">
                    <div className="flex justify-center">
                        <span className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] text-slate-400 uppercase tracking-[0.7em] font-light">
                            {t("orbit_badge")}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-7xl font-extralight text-white tracking-widest leading-tight">
                            {t("orbit_title_1")}
                        </h2>
                        <h2 className="text-5xl md:text-8xl font-bold italic tracking-tighter">
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-orange-500 to-red-800">
                                {t("orbit_title_2")}
                            </span>
                        </h2>
                    </div>

                    <p className="text-slate-400 text-base md:text-lg font-light max-w-lg mx-auto leading-relaxed tracking-wide opacity-70">
                        {t("orbit_description")}
                    </p>

                    <div className="flex justify-center pt-10">
                        <div className="w-px h-24 bg-linear-to-b from-red-500 via-red-500/50 to-transparent animate-bounce" />
                    </div>
                </motion.div>
            </motion.div>
        </motion.section>
    );
}
