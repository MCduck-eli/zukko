import pkg from "pg";
const { Client } = pkg;
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new Client({
    user: "postgres",
    host: "127.0.0.1",
    database: "template1",
    password: "postgres",
    port: 5432,
});

async function importQuestions() {
    try {
        await client.connect();
        console.log("✅ Bazaga ulanish hosil qilindi.");
        console.log("🗑️ Eski savollar tozalanmoqda...");
        await client.query("DELETE FROM questions");

        const dataDir = __dirname;
        const files = [
            { name: "javascript-question.json", category: "JavaScript" },
            { name: "math-question.json", category: "Math" },
            { name: "phyton-question.json", category: "Python" },
            { name: "java-question.json", category: "Java" },
            { name: "c++-question.json", category: "C++" },
            { name: "php-question.json", category: "PHP" },
        ];

        let totalInserted = 0;

        for (const file of files) {
            const filePath = path.join(dataDir, file.name);

            if (fs.existsSync(filePath)) {
                console.log(`⏳ ${file.name} yuklanmoqda...`);
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
