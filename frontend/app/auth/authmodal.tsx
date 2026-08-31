"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaExclamationTriangle, FaRocket, FaKey } from "react-icons/fa";
import { useSignIn, useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AuthSpaceModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
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
                router.push("/sign-in?redirect_url=/dashboard");
            }
        } catch (err: any) {
            console.error(err);
            setErrorMessage(
                err.errors?.[0]?.message || t("ERR_UNKNOWN"),
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
                    onClose();
                    router.push("/dashboard");
                    router.refresh();
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
                err.errors?.[0]?.message || t("ERR_UNKNOWN"),
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
                setIsVerifying(false);
                onClose();
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            console.error(err);
            setErrorMessage(
                err.errors?.[0]?.message || t("ERR_UNKNOWN"),
            );
            setStatus("error");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    const resetModal = () => {
        setIsVerifying(false);
        setStatus("idle");
        setErrorMessage("");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* BACKDROP */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={resetModal}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* MODAL CARD */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl z-10 will-change-transform"
                    >
                        {/* ROCKET ICON */}
                        <div className="relative h-24 flex items-center justify-center mb-4">
                            <motion.div
                                animate={
                                    status === "loading"
                                        ? { y: [0, -6, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } }
                                        : status === "success"
                                          ? { y: -300, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }
                                          : { y: 0, opacity: 1 }
                                }
                                className="text-5xl text-orange-500 z-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                            >
                                <FaRocket />
                            </motion.div>
                        </div>

                        <div className="relative z-20">
                            <h2 className="text-xl font-bold text-white text-center mb-4 tracking-tighter uppercase">
                                {status === "success"
                                    ? t("auth_success")
                                    : status === "error"
                                      ? t("auth_error")
                                      : isVerifying
                                        ? t("auth_verify_title")
                                        : isLogin
                                          ? t("auth_login_title")
                                          : t("auth_reg_title")}
                            </h2>

                            <AnimatePresence mode="wait">
                                {status === "error" && errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <FaExclamationTriangle className="text-red-500 text-xs shrink-0" />
                                            <span className="text-red-400 text-[11px] font-medium leading-tight">
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
                                        className="w-full py-3 mb-4 rounded-xl font-bold tracking-wider transition-all uppercase text-xs bg-white text-black hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
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
                                        <span>{t("auth_continue_google")}</span>
                                    </button>

                                    <div className="relative flex py-2 items-center text-slate-700">
                                        <div className="flex-grow border-t border-white/10"></div>
                                        <span className="flex-shrink mx-4 text-[9px] uppercase tracking-widest font-bold text-slate-400">
                                            {t("auth_or")}
                                        </span>
                                        <div className="flex-grow border-t border-white/10"></div>
                                    </div>

                                    <form
                                        onSubmit={handleAuth}
                                        className="space-y-3 mt-1"
                                    >
                                        {!isLogin && (
                                            <input
                                                type="text"
                                                required
                                                placeholder={t("auth_full_name_placeholder")}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white placeholder:text-white/30 focus:border-orange-500/50 outline-none transition-colors"
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
                                            placeholder={t("auth_email_placeholder")}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white placeholder:text-white/30 focus:border-orange-500/50 outline-none transition-colors"
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
                                            placeholder={t("auth_password_placeholder")}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium text-white placeholder:text-white/30 focus:border-orange-500/50 outline-none transition-colors"
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
                                            className="w-full py-3.5 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/20"
                                        >
                                            {status === "loading"
                                                ? t("auth_btn_loading")
                                                : isLogin
                                                  ? t("auth_btn_login")
                                                  : t("auth_btn_reg")}
                                        </button>
                                    </form>

                                    <div className="mt-5 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setStatus("idle");
                                                setErrorMessage("");
                                            }}
                                            className="text-[11px] text-slate-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                                        >
                                            {isLogin
                                                ? t("auth_switch_to_reg")
                                                : t("auth_switch_to_login")}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <form
                                    onSubmit={handleVerify}
                                    className="space-y-4"
                                >
                                    <p className="text-xs text-slate-300 text-center font-light leading-relaxed mb-2">
                                        <span className="font-semibold text-white">{formData.email}</span> {t("auth_code_sent_desc")}
                                    </p>
                                    <div className="relative">
                                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            placeholder={t("auth_code_placeholder")}
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
                                        className="w-full py-3.5 rounded-xl font-bold tracking-widest transition-all uppercase text-xs bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50 cursor-pointer shadow-md shadow-orange-500/20"
                                    >
                                        {status === "loading"
                                            ? t("auth_btn_loading")
                                            : t("auth_btn_verify")}
                                    </button>
                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsVerifying(false);
                                                setStatus("idle");
                                                setErrorMessage("");
                                            }}
                                            className="text-[11px] text-slate-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
                                        >
                                            {t("auth_btn_back")}
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
