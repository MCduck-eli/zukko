"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function WelcomeHero() {
    const { user, isLoaded } = useUser();
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        if (isLoaded) {
            if (user?.firstName) {
                setDisplayName(user.firstName);
            } else {
                const localUserRaw = localStorage.getItem("user");
                if (localUserRaw) {
                    try {
                        const localUser = JSON.parse(localUserRaw);
                        const name = localUser.fullName || localUser.name;
                        if (name) {
                            setDisplayName(name.split(" ")[0]);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    }, [user, isLoaded]);

    return (
        <div className="w-full mb-8 flex flex-col items-start justify-center bg-transparent select-none">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-1"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500/80">
                        Orbitaga ulanish hosil qilindi
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
                    <span>Salom,</span>
                    <span className="bg-gradient-to-r from-white via-orange-400 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        {displayName || "Astronavt"}
                    </span>
                    <span className="text-xl animate-[bounce_2s_infinite]">
                        🚀
                    </span>
                </h1>

                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider max-w-xl mt-0.5">
                    Tizim tayyor. O'z yo'nalishingizni tanlang va testni
                    boshlang.
                </p>
            </motion.div>
        </div>
    );
}
