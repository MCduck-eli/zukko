"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { subjects, programmingLanguages, SubjectType } from "./sciences";
import QuizComponent from "./quiz-component";

export default function SubjectCatalog() {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(
        null,
    );
    const [isSubCatalog, setIsSubCatalog] = useState(false);

    const activeList = isSubCatalog ? programmingLanguages : subjects;
    const itemsPerPage = 8;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = activeList.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(activeList.length / itemsPerPage);

    const handleSubjectSelect = (subject: SubjectType) => {
        if (subject.key === "it_code") {
            setIsSubCatalog(true);
            setCurrentPage(1);
            setSelectedSubject(null);
            return;
        }
        setSelectedSubject((prev) =>
            prev?.key === subject.key ? null : subject,
        );
    };

    const handleBack = () => {
        setIsSubCatalog(false);
        setCurrentPage(1);
        setSelectedSubject(null);
    };

    return (
        <div className="w-full py-4 max-w-5xl mx-auto">
            <div className="mb-6 px-4 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        {isSubCatalog && (
                            <button
                                onClick={handleBack}
                                className="text-orange-500 font-bold text-[10px] uppercase hover:underline"
                            >
                                ← {t("btn_back")}
                            </button>
                        )}
                        <h2 className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-black">
                            {isSubCatalog
                                ? t("subject_programming_languages")
                                : t("subject_catalog_title")}
                        </h2>
                    </div>
                    <div className="h-0.5 w-8 bg-orange-500 shadow-[0_0_10px_#f97316]" />
                </div>

                <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-[11px] font-bold border transition-all ${
                                currentPage === i + 1
                                    ? "bg-orange-500 border-orange-400 text-black"
                                    : "bg-white/5 border-white/10 text-white/40"
                            }`}
                        >
                            {String(i + 1).padStart(2, "0")}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isSubCatalog ? "sub" : "main"}
                        className="contents"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {currentItems.map((subject) => (
                            <button
                                key={subject.key}
                                onClick={() => handleSubjectSelect(subject)}
                                className={`group relative p-4 rounded-xl border text-left transition-all duration-300 ${
                                    selectedSubject?.key === subject.key
                                        ? "border-orange-500 bg-white/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                        : "border-white/5 bg-white/2 hover:bg-white/5"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                                        style={{
                                            backgroundColor: `${subject.color}15`,
                                            color: subject.color,
                                        }}
                                    >
                                        {subject.icon}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="text-white font-bold text-[13px] truncate">
                                            {subject.label ||
                                                t(
                                                    `subject_${subject.key}_title`,
                                                )}
                                        </h3>
                                        <p className="text-[9px] uppercase tracking-widest text-white/30 italic">
                                            {subject.key === "it_code"
                                                ? "Kirish"
                                                : "Tanlash"}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {selectedSubject && (
                    <motion.div
                        key={selectedSubject.key}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 px-2"
                    >
                        <div className="rounded-3xl border border-orange-500/20 bg-black/40 backdrop-blur-3xl p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-orange-500/20 text-orange-500">
                                        {selectedSubject.icon}
                                    </span>
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm">
                                        {selectedSubject.label ||
                                            t(
                                                `subject_${selectedSubject.key}_title`,
                                            )}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedSubject(null)}
                                    className="text-[10px] text-white/50 hover:text-white uppercase border border-white/10 px-4 py-1.5 rounded-full transition-all hover:bg-white/5"
                                >
                                    Yopish
                                </button>
                            </div>
                            <QuizComponent
                                subjectKey={selectedSubject.key}
                                onClose={() => setSelectedSubject(null)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
