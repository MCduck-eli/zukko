import pkg from "pg";
const { Client } = pkg;
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");

const client = new Client({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

async function importQuestions() {
    try {
        await client.connect();
        console.log("✅ Bazaga ulanish hosil qilindi.");

        console.log("🛠️ 'questions' jadvali tekshirilmoqda/yaratilmoqda...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                options JSONB NOT NULL,
                answer TEXT NOT NULL,
                category TEXT NOT NULL
            );
        `);

        console.log("🗑️ Eski savollar tozalanmoqda...");
        await client.query("DELETE FROM questions");

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

                for (const q of questions) {
                    const title = q.title || q.question || q.text;
                    const options = q.options || q.choices || q.variants;
                    const answer = q.answer || q.correctAnswer || q.correct;

                    if (!title || !answer || !options) continue;

                    const query = `
                        INSERT INTO questions (title, options, answer, category) 
                        VALUES ($1, $2, $3, $4)
                    `;

                    const optionsValue = Array.isArray(options)
                        ? JSON.stringify(options)
                        : options;

                    await client.query(query, [
                        title,
                        optionsValue,
                        answer,
                        file.category,
                    ]);
                    totalInserted++;
                }
                console.log(`✅ ${file.category} muvaffaqiyatli yuklandi.`);
            } else {
                console.warn(`⚠️ Fayl topilmadi: ${filePath}`);
            }
        }
        console.log(
            `\n🎉 TABRIKLAYMAN! Jami ${totalInserted} ta savol toza holda yuklandi.`,
        );
    } catch (error) {
        console.error("❌ Xatolik yuz berdi:", error);
    } finally {
        await client.end();
        console.log("🔌 Baza bilan aloqa uzildi.");
    }
}

importQuestions();
