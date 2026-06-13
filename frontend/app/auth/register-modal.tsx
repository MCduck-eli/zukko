import DifficultPassword, {
    getStrength,
} from "@/components/difficult-password";
import { AnimatePresence, motion } from "framer-motion";
import { FaIdCard, FaLock, FaUser } from "react-icons/fa";

interface RegisterModalProps {
    handleAuth: (e: React.FormEvent) => void;
    isLogin: boolean;
    t: (key: string) => string;
    formData: {
        email: string;
        password: string;
        fullName: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            email: string;
            password: string;
            fullName: string;
        }>
    >;
    status?: string;
}

export default function RegisterModal({
    handleAuth,
    isLogin,
    t,
    formData,
    setFormData,
    status,
}: RegisterModalProps) {
    const strength = getStrength(formData.password);
    const isInteractionDisabled = status === "loading" || status === "success";

    return (
        <>
            <form onSubmit={handleAuth} className="space-y-3">
                <AnimatePresence mode="wait">
                    {!isLogin && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{
                                height: "auto",
                                opacity: 1,
                            }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="relative">
                                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                                <input
                                    type="text"
                                    required
                                    disabled={isInteractionDisabled}
                                    placeholder={
                                        t("auth_full_name") || "Full Name"
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-orange-500/50 outline-none disabled:opacity-50"
                                    value={formData.fullName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            fullName: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                    <input
                        type="email"
                        required
                        disabled={isInteractionDisabled}
                        placeholder={t("auth_email")}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-orange-500/50 outline-none disabled:opacity-50"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                    />
                </div>

                <div>
                    <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xs" />
                        <input
                            type="password"
                            required
                            disabled={isInteractionDisabled}
                            placeholder={t("auth_password")}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-orange-500/50 outline-none disabled:opacity-50"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                        />
                    </div>
                    <DifficultPassword
                        strength={strength}
                        formData={formData}
                        t={t}
                    />
                </div>

                <button
                    disabled={isInteractionDisabled}
                    type="submit"
                    className={`w-full py-4 rounded-xl font-bold tracking-widest transition-all uppercase text-xs ${
                        status === "error"
                            ? "bg-red-600 text-white"
                            : "bg-orange-500 text-black hover:bg-orange-400"
                    } ${isInteractionDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {status === "loading"
                        ? t("auth_btn_loading")
                        : status === "error"
                          ? t("auth_btn_retry")
                          : isLogin
                            ? t("auth_btn_login")
                            : t("auth_btn_reg")}
                </button>
            </form>
        </>
    );
}
