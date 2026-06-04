import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "your_password",
    port: 5432,
});
async function importQuestions() {
    try {
        await client.connect();
        console.log("✅ Bazaga ulanish hosil qilindi.");
        const jsFilePath = path.join(__dirname, "javascript-question.json");
        const mathFilePath = path.join(__dirname, "math-question.json");
        const jsQuestions = JSON.parse(fs.readFileSync(jsFilePath, "utf-8"));
        const mathQuestions = JSON.parse(fs.readFileSync(mathFilePath, "utf-8"));
        const allQuestions = [
            ...jsQuestions.map((q) => ({ ...q, category: "javascript" })),
            ...mathQuestions.map((q) => ({ ...q, category: "math" })),
        ];
        console.log(`🚀 ${allQuestions.length} ta savol yuklanmoqda...`);
        for (const q of allQuestions) {
            const query = `
        INSERT INTO questions (title, options, answer, category) 
        VALUES ($1, $2, $3, $4)
      `;
            const values = [
                q.title,
                JSON.stringify(q.options),
                q.answer,
                q.category,
            ];
            await client.query(query, values);
        }
        console.log("🎉 Ma'lumotlar muvaffaqiyatli saqlandi!");
    }
    catch (error) {
        console.error("❌ Xatolik:", error);
    }
    finally {
        await client.end();
    }
}
importQuestions();
