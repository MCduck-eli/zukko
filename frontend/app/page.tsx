import CourseOrbitSection from "@/components/course-orbit-section";
import CreatorSection from "@/components/creator-section";
import HeroSection from "@/components/hero";
import LunarKnowledgeSection from "@/components/lunar-knowledge-section";

export default function Page() {
    return (
        <main className="bg-[#02040a] ">
            <HeroSection />
            <CreatorSection />
            <CourseOrbitSection />
            <LunarKnowledgeSection />
        </main>
    );
}
