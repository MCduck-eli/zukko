"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle, FaRocket, FaKey } from "react-icons/fa";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";

export default function AuthSpaceModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const { setActive, client } = useClerk();
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();

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
        if (!signIn) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            const authMethod =
                (signIn as any).authenticateWithRedirect ||
                (client?.signIn as any)?.authenticateWithRedirect;

            if (authMethod) {
                await authMethod({
                    strategy: "oauth_google",
                    redirectUrl: "/sso-callback",
                    redirectUrlComplete: "/dashboard",
                });
            } else {
                window.location.href = "/sign-in?redirect_url=/dashboard";
            }
        } catch (err: any) {
            console.error(err);
            setErrorMessage(
                err.errors?.[0]?.message || "Google orqali ulanib bo'lmadi",
            );
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signIn || !signUp) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            if (isLogin) {
                const result: any = await signIn.create({
                    identifier: formData.email,
                    password: formData.password,
                });

                const sessionId = result?.createdSessionId;

                if (result?.status === "complete" && sessionId) {
                    await setActive({ session: sessionId });
                    setStatus("success");
                    setTimeout(() => {
                        onClose();
                        window.location.href = "/dashboard";
                    }, 1500);
                } else {
                    setStatus("idle");
                }
            } else {
                const nameParts = formData.fullName.trim().split(" ");
                await signUp.create({
                    emailAddress: formData.email,
                    password: formData.password,
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                });

                const prepareMethod =
                    (signUp as any).prepareVerification ||
                    (signUp as any).prepareEmailAddressVerification;

                if (prepareMethod) {
                    await prepareMethod({ strategy: "email_code" });
                }

                setStatus("idle");
                setIsVerifying(true);
            }
        } catch (err: any) {
            console.error(err);
            setErrorMessage(
                err.errors?.[0]?.message || "Tizimda xatolik yuz berdi",
            );
            setStatus("error");
            setTimeout(() => setStatus("idle"), 4000);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signUp) return;
        setStatus("loading");
        setErrorMessage("");

        try {
            const attemptMethod =
                (signUp as any).attemptVerification ||
                (signUp as any).attemptEmailAddressVerification;

            let completeSignUp: any;
            if (attemptMethod) {
                completeSignUp = await attemptMethod({
                    code: verificationCode,
                    strategy: "email_code",
                });
            }

            const sessionId = completeSignUp?.createdSessionId;

            if (completeSignUp?.status === "complete" && sessionId) {
                await setActive({
                    session: sessionId,
                });
                setStatus("success");
                setTimeout(() => {
                    onClose();
                    setIsVerifying(false);
                    window.location.href = "/dashboard";
                }, 1500);
            }
        } catch (err: any) {
            console.error(err);
            setErrorMessage(
                err.errors?.[0]?.message || "Kod xato yoki muddati o'tgan",
            );
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
                                        className="w-full py-3 mb-4 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-white text-black hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

                                    <form
                                        onSubmit={handleAuth}
                                        className="space-y-3"
                                    >
                                        {!isLogin && (
                                            <input
                                                type="text"
                                                required
                                                placeholder="ISM VA FAMILIYA"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none"
                                                value={formData.fullName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        fullName:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                        <input
                                            type="email"
                                            required
                                            placeholder="EMAIL POCHTA"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                        <input
                                            type="password"
                                            required
                                            placeholder="PAROL"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-orange-500/50 outline-none"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                        />
                                        <button
                                            disabled={status === "loading"}
                                            type="submit"
                                            className="w-full py-3.5 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 cursor-pointer"
                                        >
                                            {status === "loading"
                                                ? t("Kutilmoqda...")
                                                : isLogin
                                                  ? t("Kirish")
                                                  : t("Ro'yxatdan o'tish")}
                                        </button>
                                    </form>

                                    <div className="mt-6 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setStatus("idle");
                                            }}
                                            className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
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
                                        {formData.email} pochtasiga tasdiqlash
                                        kodi yuborildi.
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
                                        className="w-full py-4 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 cursor-pointer"
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
                                            className="text-[10px] text-slate-500 uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
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
