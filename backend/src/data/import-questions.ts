import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "❌ SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY .env faylida topilmadi!",
    );
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importQuestions() {
    try {
        console.log("⚡ Supabase API'ga ulanish o'rnatilmoqda...");

        console.log("🗑️ Eski savollar tozalanmoqda...");
        const { error: deleteError } = await supabase
            .from("questions")
            .delete()
            .neq("id", 0);
        if (deleteError) {
            console.warn(
                "⚠️ Tozalashda ogohlantirish (jadval bo'sh bo'lishi mumkin):",
                deleteError.message,
            );
        }

        const dataDir = __dirname;
        const files = [
            { name: "javascript-question.json", category: "javascript" },
            { name: "math-question.json", category: "math" },
            { name: "phyton-question.json", category: "python" },
            { name: "java-question.json", category: "java" },
            { name: "c++-question.json", category: "cpp" },
            { name: "php-question.json", category: "php" },
            { name: "swift-question.json", category: "swift" },
            { name: "go-question.json", category: "go" },
            { name: "physics-question.json", category: "physics" },
            { name: "chemistry-question.json", category: "chemistry" },
            { name: "biology-question.json", category: "biology" },
            { name: "history-quiz.json", category: "history" },
            { name: "geography-question.json", category: "geography" },
            { name: "literature-question.json", category: "literature" },

            { name: "english-question.json", category: "english" },
            { name: "english-question.json", category: "english-language" },

            { name: "russian-question.json", category: "russian" },
            { name: "russian-question.json", category: "russian-language" },

            { name: "korean-question.json", category: "korean" },
            { name: "korean-question.json", category: "korean_state_exam" },

            {
                name: "native-languange-question.json",
                category: "native-language",
            },
            {
                name: "native-languange-question.json",
                category: "native-languange",
            },
            {
                name: "native-languange-question.json",
                category: "mother_tongue",
            },
        ];

        let totalInserted = 0;

        for (const file of files) {
            const filePath = path.join(dataDir, file.name);

            if (fs.existsSync(filePath)) {
                console.log(
                    `⏳ ${file.name} -> [${file.category}] yuklanmoqda...`,
                );
                const content = fs.readFileSync(filePath, "utf-8");
                const questions = JSON.parse(content);

                const batch = [];

                for (const q of questions) {
                    const title = q.title || q.question || q.text;
                    const options = q.options || q.choices || q.variants;
                    const answer = q.answer || q.correctAnswer || q.correct;

                    if (!title || !answer || !options) continue;

                    batch.push({
                        title: title,
                        options: options,
                        answer: String(answer),
                        category: file.category,
                    });
                }

                if (batch.length > 0) {
                    const { error } = await supabase
                        .from("questions")
                        .insert(batch);
                    if (error) {
                        console.error(
                            `❌ Xato [${file.category}]:`,
                            error.message,
                        );
                    } else {
                        totalInserted += batch.length;
                        console.log(
                            `✅ ${file.category} muvaffaqiyatli yuklandi.`,
                        );
                    }
                }
            } else {
                console.warn(`⚠️ Fayl topilmadi: ${filePath}`);
            }
        }

        console.log(
            `\n🎉 TABRIKLAYMAN! Jami ${totalInserted} ta savol Supabase'ga toza holda yuklandi.`,
        );
    } catch (error) {
        console.error("❌ BATAFSIL XATOLIK:", error);
    }
}

importQuestions();
