"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function LayoutLoaderHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        setIsNavigating(false);
    }, [pathname, searchParams]);

    // Lightweight top progress bar or non-blocking transition
    if (isNavigating) {
        return (
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-orange-500 z-50 animate-pulse" />
        );
    }

    return null;
}
