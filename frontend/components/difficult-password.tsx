"use client";

import { motion } from "framer-motion";

export const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[@$!%*#?&]/.test(pass)) score++;
    return score;
};

interface DifficultPasswordProps {
    strength: number;
    formData: {
        password: string;
    };
    t: (key: string) => string;
}

export default function DifficultPassword({
    strength,
    formData,
    t,
}: DifficultPasswordProps) {
    return (
        <div className="space-y-2 mt-2 px-1">
            <div className="flex gap-1.5 h-1">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${
                            strength >= step
                                ? strength === 1
                                    ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                                    : strength === 2
                                      ? "bg-orange-500 shadow-[0_0_8px_#f97316]"
                                      : strength === 3
                                        ? "bg-yellow-500 shadow-[0_0_8px_#eab308]"
                                        : "bg-emerald-500 shadow-[0_0_10px_#10b981]"
                                : "bg-white/10"
                        }`}
                    />
                ))}
            </div>

            {formData.password && (
                <motion.p
                    key={strength}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-[9px] uppercase tracking-[0.2em] font-bold ${
                        strength <= 1
                            ? "text-red-500"
                            : strength === 2
                              ? "text-orange-500"
                              : strength === 3
                                ? "text-yellow-500"
                                : "text-emerald-500"
                    }`}
                >
                    {strength === 0 && t("pass_too_short")}
                    {strength === 1 && t("pass_weak")}
                    {strength === 2 && t("pass_fair")}
                    {strength === 3 && t("pass_good")}
                    {strength === 4 && t("pass_strong")}
                </motion.p>
            )}
        </div>
    );
}
