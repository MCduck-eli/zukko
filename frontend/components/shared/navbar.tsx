"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LogOut, Orbit, UserCircle2, Menu, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
    defaultLanguage,
    supportedLanguages,
    type SupportedLanguage,
} from "../../i18n";
import AuthSpaceModal from "@/app/auth/authmodal";

export function Navbar() {
    const { i18n, t } = useTranslation();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isLoggedIn = useSyncExternalStore(
        (onStoreChange) => {
            window.addEventListener("storage", onStoreChange);
            window.addEventListener("auth-change", onStoreChange);

            return () => {
                window.removeEventListener("storage", onStoreChange);
                window.removeEventListener("auth-change", onStoreChange);
            };
        },
        () => Boolean(localStorage.getItem("access_token")),
        () => false,
    );

    useEffect(() => {
        const savedLanguage = localStorage.getItem(
            "preferred_language",
        ) as SupportedLanguage | null;
        const browserLanguage = navigator.language.slice(
            0,
            2,
        ) as SupportedLanguage;
        const nextLanguage = supportedLanguages.includes(
            savedLanguage as SupportedLanguage,
        )
            ? savedLanguage
            : supportedLanguages.includes(browserLanguage)
              ? browserLanguage
              : defaultLanguage;

        i18n.changeLanguage(nextLanguage || "uz");
    }, [i18n]);

    const toggleLanguage = (lng: string) => {
        const nextLanguage = lng as SupportedLanguage;
        localStorage.setItem("preferred_language", nextLanguage);
        i18n.changeLanguage(nextLanguage);
    };

    const currentLanguage = supportedLanguages.includes(
        i18n.resolvedLanguage as SupportedLanguage,
    )
        ? (i18n.resolvedLanguage as SupportedLanguage)
        : defaultLanguage;

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-change"));
        window.location.href = "/";
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-10 py-4 border-b border-white/5 bg-black/40 backdrop-blur-xl"
            >
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="relative">
                        <Orbit className="w-7 h-7 md:w-8 md:h-8 text-cyan-500 group-hover:rotate-180 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full" />
                    </div>
                    <span className="text-lg md:text-xl font-medium tracking-tighter text-white uppercase italic">
                        Zuk<span className="text-cyan-500">kO</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-4 md:gap-8">
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-lg backdrop-blur-md">
                        {supportedLanguages.map((lng) => (
                            <button
                                key={lng}
                                onClick={() => toggleLanguage(lng)}
                                className={`px-2 md:px-3 py-1 rounded-md text-[10px] uppercase tracking-widest transition-all duration-300 ${
                                    currentLanguage === lng
                                        ? "bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                        : "text-slate-500 hover:text-white"
                                }`}
                            >
                                {lng}
                            </button>
                        ))}
                    </div>

                    {isLoggedIn ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="relative group overflow-hidden px-5 py-2 rounded-full border border-red-500/30 bg-red-500/5 transition-all"
                        >
                            <div className="relative z-10 flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-red-400" />
                                <span className="text-[11px] text-white uppercase tracking-[0.2em] font-bold">
                                    {t("nav_logout")}
                                </span>
                            </div>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAuthOpen(true)}
                            className="relative group overflow-hidden px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 transition-all"
                        >
                            <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                            <div className="relative z-10 flex items-center gap-2">
                                <UserCircle2 className="w-4 h-4 text-cyan-400" />
                                <span className="text-[11px] text-white uppercase tracking-[0.2em] font-bold">
                                    {t("nav_auth_btn")}
                                </span>
                            </div>
                        </motion.button>
                    )}

                    <div className="flex items-center gap-2 px-3 py-1 border-l border-white/10 ml-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                        <span className="text-[10px] text-cyan-500/80 uppercase tracking-[0.2em] font-medium">
                            Live
                        </span>
                    </div>
                </div>

                <div className="flex md:hidden items-center gap-3">
                    <div className="flex items-center gap-1 px-2 py-0.5 border-l border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                        <span className="text-[9px] text-cyan-500/80 uppercase tracking-[0.2em] font-medium">
                            Live
                        </span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white bg-white/5 border border-white/10 rounded-lg"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-[69px] left-0 right-0 z-40 flex flex-col gap-5 p-6 border-b border-white/5 bg-black/90 backdrop-blur-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                {t("Changer Language")}
                            </span>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-lg w-fit">
                                {supportedLanguages.map((lng) => (
                                    <button
                                        key={lng}
                                        onClick={() => {
                                            toggleLanguage(lng);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`px-3 py-1.5 rounded-md text-[11px] uppercase tracking-widest transition-all duration-300 ${
                                            currentLanguage === lng
                                                ? "bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {lng}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[1px] bg-white/5 w-full" />

                        {isLoggedIn ? (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-white text-xs uppercase tracking-widest font-bold"
                            >
                                <LogOut className="w-4 h-4 text-red-400" />
                                {t("nav_logout")}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsAuthOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-white text-xs uppercase tracking-widest font-bold"
                            >
                                <UserCircle2 className="w-4 h-4 text-cyan-400" />
                                {t("nav_auth_btn")}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AuthSpaceModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
        </>
    );
}
