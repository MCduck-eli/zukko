"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle, FaRocket, FaKey } from "react-icons/fa";
import { useClerk } from "@clerk/nextjs";
import RegisterModal from "./register-modal";

export default function AuthSpaceModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const clerk = useClerk();

    const [isLogin, setIsLogin] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
    });

    const handleGoogleAuth = async () => {
        if (!clerk || !clerk.client || !clerk.client.signIn) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            await clerk.client.signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback?redirect_url=/dashboard",
                redirectUrlComplete: "/dashboard",
            });
        } catch (err: any) {
            console.error(err);
            setErrorMessage("Google orqali ulanib bo'lmadi");
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

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
                if (!isLogin) {
                    setStatus("idle");
                    setIsVerifying(true);
                    return;
                }

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
                if (response.status === 403 && result.status === "unverified") {
                    setStatus("idle");
                    setIsVerifying(true);
                    return;
                }
                setErrorMessage(
                    result.details || result.message || "Tizimda xatolik",
                );
                setStatus("error");
                setTimeout(() => setStatus("idle"), 5000);
            }
        } catch (err: any) {
            setErrorMessage("Serverga ulanib bo'lmadi: " + err.message);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${API_URL}/auth/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    code: verificationCode,
                }),
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
                    setIsVerifying(false);
                    window.location.href = "/dashboard";
                }, 2000);
            } else {
                setErrorMessage(
                    result.message || "Kod xato yoki muddati o'tgan",
                );
                setStatus("error");
                setTimeout(() => setStatus("idle"), 3000);
            }
        } catch (err) {
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
                                      : isVerifying
                                        ? t("Emailni tasdiqlash")
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

                            {!isVerifying ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={status === "loading"}
                                        onClick={handleGoogleAuth}
                                        className="w-full py-3 mb-4 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-white text-black hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#EA4335"
                                                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.432 2.07 15.608 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-11 0-.746-.08-1.32-.176-1.765H12.24z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </button>

                                    <div className="relative flex py-2 items-center text-slate-700">
                                        <div className="flex-grow border-t border-white/5"></div>
                                        <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest font-bold text-slate-500">
                                            {t("yoki")}
                                        </span>
                                        <div className="flex-grow border-t border-white/5"></div>
                                    </div>

                                    <RegisterModal
                                        handleAuth={handleAuth}
                                        isLogin={isLogin}
                                        t={t}
                                        formData={formData}
                                        setFormData={setFormData}
                                        status={status}
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
                                </>
                            ) : (
                                <form
                                    onSubmit={handleVerify}
                                    className="space-y-4"
                                >
                                    <p className="text-xs text-slate-400 text-center font-light leading-relaxed mb-2">
                                        {formData.email} pochtasiga 6 xonali
                                        tasdiqlash kodi yuborildi.
                                    </p>
                                    <div className="relative">
                                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder="6 XONALI KOD"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-center font-bold tracking-[0.5em] text-white focus:border-orange-500/50 outline-none"
                                            value={verificationCode}
                                            onChange={(e) =>
                                                setVerificationCode(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <button
                                        disabled={
                                            status === "loading" ||
                                            status === "success"
                                        }
                                        type="submit"
                                        className="w-full py-4 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {status === "loading"
                                            ? t("Kutilmoqda...")
                                            : t("Tasdiqlash")}
                                    </button>
                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsVerifying(false);
                                                setStatus("idle");
                                            }}
                                            className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            Orqaga qaytish
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
