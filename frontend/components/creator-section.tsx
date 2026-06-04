"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Image from "next/image";

export default function CreatorSection() {
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
    const planetRotate = useTransform(smoothProgress, [0, 1], [0, 45]);
    const textY = useTransform(smoothProgress, [0, 1], ["40px", "-40px"]);
    const contentOpacity = useTransform(
        smoothProgress,
        [0, 0.2, 0.8, 1],
        [0, 1, 1, 0],
    );

    const stars = Array.from({ length: 400 });

    const socials = [
        {
            name: "Youtube",
            link: "https://www.youtube.com/@eldor_halikov",
            icon: <FaYoutube size={20} />,
        },
        {
            name: "Linkedin",
            link: "https://www.linkedin.com/in/eldorjon-abdukholikov/",
            icon: <FaLinkedin size={20} />,
        },
        {
            name: "Instagram",
            link: "https://www.instagram.com/eldor.halikov/",
            icon: <FaInstagram size={20} />,
        },
    ];

    return (
        <section
            ref={sectionRef}
            className="relative min-h-[160vh] flex items-center justify-center overflow-hidden bg-[#05010a]"
        >
            <motion.div style={{ y: starsY }} className="absolute inset-0 z-0">
                {stars.map((_, i) => (
                    <div
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            width: Math.random() * 2 + 0.5 + "px",
                            height: Math.random() * 2 + 0.5 + "px",
                            left: Math.random() * 100 + "%",
                            top: Math.random() * 200 + "%",
                            opacity: Math.random() * 0.7 + 0.3,
                        }}
                    />
                ))}
            </motion.div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(124,58,237,0.1),transparent_60%)]" />

            <motion.div
                style={{ y: planetY, rotate: planetRotate }}
                className="absolute right-[-10%] bottom-[10%] w-125 h-125 md:w-200 md:h-200 pointer-events-none"
            >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,#fcd34d_0%,#b45309_50%,#05010a_100%)] shadow-[0_0_120px_rgba(251,191,36,0.15)] opacity-90" />
                <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160%] h-12.5 border-15 border-orange-900/10 rounded-[100%] rotate-[-25deg] blur-[2px]"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[155%] h-7.5 border-2 border-white/5 rounded-[100%] rotate-[-25deg]" />
            </motion.div>

            <motion.div
                style={{ y: textY, opacity: contentOpacity }}
                className="relative z-10 container mx-auto px-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-8 bg-linear-to-r from-orange-500/10 to-purple-500/10 blur-3xl opacity-50"></div>
                        <div className="relative aspect-square w-full max-w-95 border border-white/10 bg-[#0a0a0c] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="/im.jpeg"
                                alt="Eldor Khalikov"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
                                sizes="(max-width: 768px) 100vw, 400px"
                                priority
                            />

                            <div className="absolute inset-0 bg-linear-to-t from-[#05010a] via-[#05010a]/20 to-transparent opacity-90" />
                            <div className="relative h-full flex flex-col justify-end p-6 pb-4 translate-y-2">
                                <div className="space-y-0">
                                    <h3 className="text-2xl font-bold text-white tracking-tighter uppercase leading-tight">
                                        Eldor Khalikov
                                    </h3>
                                    <p className="text-orange-400 font-mono text-[9px] tracking-[0.2em] uppercase font-bold mb-3">
                                        Born: Jan 26, 2002
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    {socials.map((s, i) => (
                                        <a
                                            key={i}
                                            href={s.link}
                                            target="_blanck"
                                            className="p-2.5 rounded-xl border border-white/10 text-white/40 bg-black/40 backdrop-blur-md hover:text-orange-400 hover:border-orange-400/50 transition-all"
                                        >
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div className="inline-block px-5 py-1.5 border border-orange-500/20 bg-orange-500/5 rounded-full text-orange-400 text-[9px] uppercase tracking-[0.4em] font-bold">
                            Identity Protocol
                        </div>

                        <h2 className="text-5xl md:text-7xl font-medium text-white leading-tight tracking-tighter">
                            {t("creator_title_1")}{" "}
                            <span className="text-orange-400 italic">
                                {t("creator_title_2")}
                            </span>
                        </h2>

                        <p className="text-slate-400 text-xl font-light leading-relaxed max-w-lg">
                            {t("creator_description")}
                        </p>

                        <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10 font-bold">
                            <div>
                                <h4 className="text-white text-2xl tracking-tighter">
                                    2026
                                </h4>
                                <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] mt-2 font-normal">
                                    Launch Year
                                </p>
                            </div>
                            <div>
                                <h4 className="text-orange-400 text-2xl tracking-tighter">
                                    Jan 26
                                </h4>
                                <p className="text-slate-500 text-[9px] uppercase tracking-[0.2em] mt-2 font-normal">
                                    Origin Day
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
