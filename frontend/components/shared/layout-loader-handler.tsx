"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import GlobalLoader from "../ui/global-loader";

export default function LayoutLoaderHandler() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoaded } = useAuth();
    const [isPageLoading, setIsPageLoading] = useState(false);

    useEffect(() => {
        setIsPageLoading(false);
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (anchor && anchor.href && anchor.target !== "_blank") {
                const targetUrl = new URL(anchor.href);
                if (
                    targetUrl.origin === window.location.origin &&
                    targetUrl.pathname !== pathname
                ) {
                    setIsPageLoading(true);
                }
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => document.removeEventListener("click", handleAnchorClick);
    }, [pathname]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            setIsPageLoading(true);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, []);

    if (!isLoaded || isPageLoading) {
        return <GlobalLoader />;
    }

    return null;
}
