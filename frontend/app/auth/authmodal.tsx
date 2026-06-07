"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle, FaRocket } from "react-icons/fa";
import RegisterModal from "./register-modal";

export default function AuthSpaceModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const endpoint = isLogin ? "/auth/login" : "/auth/register";

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                if (result.token) {
                    localStorage.setItem("access_token", result.token);
                    localStorage.setItem("user", JSON.stringify(result.user));
                }

                setStatus("success");
                setTimeout(() => {
                    onClose();
                    window.location.href = "/dashboard";
                }, 2000);
            } else {
                setErrorMessage(result.message || "Tizimda xatolik");
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (err) {
            console.error("Ulanishda xato:", err);
            setErrorMessage("Serverga ulanib bo'lmadi");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.8, y: 100, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 100, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden"
                    >
                        <div className="relative h-32 flex items-center justify-center mb-6">
                            <motion.div
                                animate={
                                    status === "loading"
                                        ? {
                                              y: [0, -5, 0],
                                              rotate: [0, -1, 1, 0],
                                          }
                                        : status === "success"
                                          ? { y: -500, opacity: 0 }
                                          : status === "error"
                                            ? {
                                                  scale: [1, 1.5, 0],
                                                  rotate: [0, 20, -20],
                                              }
                                            : {}
                                }
                                transition={{
                                    duration: status === "success" ? 1 : 0.5,
                                    repeat: status === "loading" ? Infinity : 0,
                                }}
                                className="text-5xl text-orange-500 z-10"
                            >
                                <FaRocket />
                            </motion.div>
                        </div>

                        <div className="relative z-20">
                            <h2 className="text-xl font-bold text-white text-center mb-4 tracking-tighter uppercase">
                                {status === "success"
                                    ? t("Muvaffaqiyatli!")
                                    : status === "error"
                                      ? t("Xatolik!")
                                      : isLogin
                                        ? t("Kirish")
                                        : t("Ro'yxatdan o'tish")}
                            </h2>

                            <AnimatePresence>
                                {status === "error" && errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4"
                                    >
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <FaExclamationTriangle className="text-red-500 text-xs" />
                                            <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">
                                                {errorMessage}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <RegisterModal
                                handleAuth={handleAuth}
                                isLogin={isLogin}
                                t={t}
                                formData={formData}
                                setFormData={setFormData}
                            />

                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setStatus("idle");
                                    }}
                                    className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {isLogin
                                        ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting"
                                        : "Hisobingiz bormi? Kirish"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
