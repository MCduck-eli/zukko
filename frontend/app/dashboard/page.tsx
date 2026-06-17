"use client";
import { motion } from "framer-motion";
import SubjectCatalog from "./components/subject-catalalog";
import WelcomeHero from "@/components/dashboard/welcome-hero";

export default function DashboardPage() {
    return (
        <div className="relative min-h-screen w-full bg-[#020203] overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30" />
                    {[...Array(2)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 8 + i * 4,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 will-change-transform"
                            style={{
                                transform: `rotate(${i * 45}deg) scale(${1 + i * 0.1})`,
                            }}
                        />
                    ))}
                </div>
                <div className="relative flex items-center justify-center w-150 h-150 z-10">
                    <div className="absolute w-44 h-44 bg-black rounded-full z-50 shadow-[0_0_100px_50px_rgba(0,0,0,1)]" />
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.01, 1],
                        }}
                        transition={{
                            rotate: {
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear",
                            },
                            scale: {
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                        className="absolute w-45 h-45 rounded-full z-40 border-2 border-orange-500/50 shadow-[0_0_120px_40px_rgba(249,115,22,0.4),inset_0_0_50px_rgba(249,115,22,0.2)] will-change-transform"
                    />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 60,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="absolute z-30 opacity-80 blur-[1px] will-change-transform"
                        style={{
                            width: "800px",
                            height: "300px",
                            background:
                                "radial-gradient(ellipse at center, rgba(249,115,22,0) 20%, rgba(249,115,22,0.7) 35%, rgba(249,115,22,0.8) 45%, rgba(194,65,12,0.4) 60%, transparent 80%)",
                            borderRadius: "50%",
                            transform: "rotateX(75deg) rotateY(-5deg)",
                        }}
                    />
                    <div className="absolute w-225 h-225 bg-orange-600/5 rounded-full blur-[80px] z-10 backward-render" />
                </div>
            </div>

            <main className="relative z-10 w-full min-h-screen flex flex-col items-center">
                <div className="pt-20 pb-20 px-4 md:px-10 w-full max-w-7xl">
                    <WelcomeHero />
                    <SubjectCatalog />
                </div>
            </main>
        </div>
    );
}
