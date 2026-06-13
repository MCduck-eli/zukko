"use client";

export default function GlobalLoader() {
    return (
        <div className="fixed inset-0 w-screen h-screen z-[999999] flex items-center justify-center bg-[#0a0a0c]">
            <div className="relative flex items-center justify-center w-[120px] h-[120px] font-sans text-[0.9em] font-normal text-white rounded-full bg-transparent select-none">
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0s]">
                    G
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.1s]">
                    e
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.2s]">
                    n
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.3s]">
                    e
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.4s]">
                    r
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.5s]">
                    a
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.6s]">
                    t
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.7s]">
                    i
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.8s]">
                    n
                </span>
                <span className="inline-block opacity-40 animate-[loader-letter-anim_2s_infinite] z-10 [animation-delay:0.9s]">
                    g
                </span>
                <div className="absolute inset-0 w-full h-full rounded-full bg-transparent animate-[loader-rotate_2s_linear_infinite] z-0" />
            </div>
        </div>
    );
}
