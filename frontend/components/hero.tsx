"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Sparkles, BrainCircuit, Rocket, LayoutDashboard } from "lucide-react";
import "../i18n";
import AuthSpaceModal from "@/app/auth/authmodal";
import AboutModal from "@/components/about-modal";
import Cabinet from "@/components/cabinet/cabinet";
import { useUser } from "@clerk/nextjs";

export default function HeroSection() {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isCabinetOpen, setIsCabinetOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { isSignedIn: isClerkSignedIn, isLoaded } = useUser();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoggedIn = mounted && isLoaded && isClerkSignedIn;

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    const starsY = useTransform(smoothProgress, [0, 1], ["0%", "-300%"]);
    const starStretch = useTransform(smoothProgress, [0, 0.8, 1], [1, 1, 25]);
    const starOpacity = useTransform(
        smoothProgress,
        [0, 0.8, 1],
        [0.6, 0.8, 0],
    );

    const contentY = useTransform(smoothProgress, [0, 1], [0, -300]);
    const contentScale = useTransform(smoothProgress, [0, 1], [1, 0.5]);
    const contentOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);

    const planetY = useTransform(smoothProgress, [0, 1], ["0%", "150%"]);
    const planetScale = useTransform(smoothProgress, [0, 1], [1, 0.2]);

    const stars = Array.from({ length: 200 });

    const getRand = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        const val = x - Math.floor(x);
        return Number(val.toFixed(4));
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#02040a]"
        >
            <motion.div
                style={{
                    y: starsY,
                    scaleY: starStretch,
                    opacity: starOpacity,
                    originY: 0,
                }}
                className="absolute inset-0 z-0"
            >
                {stars.map((_, i) => {
                    const width = (getRand(i) * 2 + 0.5).toFixed(2);
                    const height = (getRand(i + 200) * 2 + 0.5).toFixed(2);
                    const left = (getRand(i + 400) * 100).toFixed(2);
                    const top = (getRand(i + 600) * 200).toFixed(2);

                    return (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                left: `${left}%`,
                                top: `${top}%`,
                            }}
                        />
                    );
                })}
            </motion.div>

            <motion.div
                style={{ y: planetY, scale: planetScale }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                transition={{ duration: 3 }}
                className="absolute -top-[10%] -left-[5%] w-100 h-100 md:w-150 md:h-150"
            >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#a5f3fc_0%,#0891b2_50%,#020617_100%)] shadow-[0_0_80px_rgba(34,211,238,0.15)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-0.5 bg-white/5 rotate-110 blur-sm" />
            </motion.div>

            <motion.div
                style={{
                    y: contentY,
                    opacity: contentOpacity,
                    scale: contentScale,
                }}
                className="relative z-10 flex flex-col items-center px-6 text-center max-w-4xl"
            >
                <motion.div
                    initial={{ y: -15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400/80 text-[10px] mb-8 tracking-[0.3em] uppercase backdrop-blur-md"
                >
                    <BrainCircuit size={14} />
                    <span>Next-Gen Proctoring</span>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-4xl md:text-6xl font-medium tracking-tight text-white leading-[1.1]"
                >
                    <span className="bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/40">
                        {t("welcome")}
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-6 text-sm md:text-lg text-slate-500 max-w-xl font-light tracking-wide leading-relaxed"
                >
                    {t("description")}
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                    <Button
                        size="lg"
                        onClick={() => {
                            if (isLoggedIn) {
                                setIsCabinetOpen(true);
                            } else {
                                setIsAuthOpen(true);
                            }
                        }}
                        className="group bg-white text-black hover:bg-slate-200 rounded-md px-10 h-12 text-sm font-semibold transition-all w-full sm:w-auto cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            {isLoggedIn ? (
                                <>
                                    <span>Kabinet</span>
                                    <LayoutDashboard
                                        size={18}
                                        className="group-hover:scale-110 transition-transform"
                                    />
                                </>
                            ) : (
                                <>
                                    <span>{t("start")}</span>
                                    <Rocket
                                        size={18}
                                        className="group-hover:-translate-y-1 transition-transform"
                                    />
                                </>
                            )}
                        </span>
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setIsAboutOpen(true)}
                        className="rounded-md border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 h-12 text-sm backdrop-blur-sm transition-all hover:text-white w-full sm:w-auto"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles size={18} className="text-cyan-400" />
                            {t("about")}
                        </span>
                    </Button>
                </motion.div>
            </motion.div>

            <div className="absolute bottom-10 w-full flex justify-center opacity-20">
                <div className="w-64 h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent" />
            </div>

            <AuthSpaceModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
                t={t}
            />
            <Cabinet
                isOpen={isCabinetOpen}
                onClose={() => setIsCabinetOpen(false)}
            />
        </div>
    );
}
