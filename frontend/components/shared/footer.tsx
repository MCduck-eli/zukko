"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function GlobalSpaceFooter() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#020004] py-20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <motion.div
                    animate={{
                        opacity: [0.05, 0.15, 0.05],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-125 h-62.5 bg-orange-600/10 blur-[100px] rounded-full"
                />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 2 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-xl md:text-2xl font-extralight tracking-[1.2em] text-white/30 uppercase ml-[1.2em]">
                            <span className="text-orange-500/40">Universe</span>
                        </h2>
                        <div className="text-slate-800 text-lg font-thin mt-2 select-none">
                            ∞
                        </div>
                    </motion.div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="text-[10px] text-slate-700 uppercase tracking-[0.4em] font-light text-center">
                            © {currentYear}Universe
                        </div>
                        <div className="text-[9px] text-slate-800 uppercase tracking-[0.2em] font-medium text-center">
                            {t("footer_rights")}
                        </div>
                    </div>
                    <motion.button
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        whileHover={{ y: -5 }}
                        className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-100 opacity-60"
                    >
                        <span className="w-px h-10 bg-linear-to-t from-orange-500/50 to-transparent group-hover:h-14 transition-all duration-500" />
                        <span className="text-[8px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                            {t("footer_top")}
                        </span>
                    </motion.button>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </footer>
    );
}
