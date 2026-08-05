"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import CourseOrbitSection from "@/components/course-orbit-section";
import CreatorSection from "@/components/creator-section";
import HeroSection from "@/components/hero";
import LunarKnowledgeSection from "@/components/lunar-knowledge-section";

export default function Page() {
    const { isSignedIn, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace("/dashboard");
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isSignedIn) {
        return null;
    }

    return (
        <main className="bg-[#02040a]">
            <HeroSection />
            <CreatorSection />
            <CourseOrbitSection />
            <LunarKnowledgeSection />
        </main>
    );
}
