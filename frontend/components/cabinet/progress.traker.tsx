export default function ProgressTracker({ plans }: { plans: any[] }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-white/60">
                O'quv dinamikasi
            </h4>
            <div className="grid grid-cols-1 gap-4">
                {plans.map((p, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white/[0.03] rounded-lg border border-white/5"
                    >
                        <p className="text-xs text-white/40">{p.category}</p>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-cyan-400">
                                {p.score}
                            </span>
                            <span className="text-[10px] text-white/30 pb-1">
                                ball
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            {plans.length === 0 && (
                <p className="text-xs text-white/30 text-center">
                    Hali yetarli ma'lumot yo'q.
                </p>
            )}
        </div>
    );
}
