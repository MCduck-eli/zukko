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

    return (
        <main className="bg-[#02040a]">
            <HeroSection />
            <CreatorSection />
            <CourseOrbitSection />
            <LunarKnowledgeSection />
        </main>
    );
}
