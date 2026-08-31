import express, { Request, Response, Router } from "express";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();

const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
const dbPool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Auto-initialize ai_plans table
async function initAiPlansTable() {
    try {
        await dbPool.query(`
            CREATE TABLE IF NOT EXISTS ai_plans (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                score VARCHAR(50),
                plan TEXT NOT NULL,
                is_read BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    } catch (e) {
        console.error("ai_plans jadvalini yaratishda xato:", e);
    }
}
initAiPlansTable();

interface WrongAnswer {
    question: string;
    userAnswer: string;
    correctAnswer: string;
}

interface StudyPlanRequestBody {
    userId: string;
    category?: string;
    scoreText: string;
    wrongAnswers?: WrongAnswer[];
}

let cachedGroqModels: string[] = [];
let lastModelsFetchTime = 0;

async function getActiveGroqModels(apiKey: string): Promise<string[]> {
    if (cachedGroqModels.length > 0 && Date.now() - lastModelsFetchTime < 30 * 60 * 1000) {
        return cachedGroqModels;
    }
    try {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
            headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.data)) {
                const chatModels = data.data
                    .map((m: any) => m.id)
                    .filter((id: string) => 
                        !id.includes("whisper") && 
                        !id.includes("guard") && 
                        !id.includes("tts") &&
                        !id.includes("embedding")
                    );
                if (chatModels.length > 0) {
                    cachedGroqModels = chatModels;
                    lastModelsFetchTime = Date.now();
                    return cachedGroqModels;
                }
            }
        }
    } catch (e) {
        console.error("Groq modellarini aniqlashda xatolik:", e);
    }
    return [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama-3.2-3b-preview",
        "llama-3.2-1b-preview",
        "qwen-2.5-32b"
    ];
}

function generateSmartStudyPlan(category: string, scoreText: string, wrongAnswers: WrongAnswer[]): string {
    const subject = (category || "Fan").toUpperCase();
    let plan = `### 🎯 ${subject} Fani Bo'yicha Shaxsiy AI O'quv Rejasi\n\n`;
    plan += `**📊 Test natijangiz:** \`${scoreText}\`\n\n`;

    if (wrongAnswers.length > 0) {
        plan += `#### 🔍 Xatolar tahlili va e'tibor qaratilishi kerak bo'lgan savollar:\n\n`;
        wrongAnswers.forEach((w, idx) => {
            plan += `**${idx + 1}. Savol:** *${w.question}*\n`;
            plan += `- ❌ **Sizning javobingiz:** ${w.userAnswer}\n`;
            plan += `- ✅ **To'g'ri javob:** \`${w.correctAnswer}\`\n\n`;
        });

        plan += `---\n\n### 🗓️ 3 Kunlik Intensiv O'quv Rejasi:\n\n`;
        plan += `#### 📌 1-KUN: Nazariy asoslar va xatolarni tahlil qilish\n`;
        plan += `- [ ] Yuqoridagi xato qilingan ${wrongAnswers.length} ta savol bo'yicha qoidalar va asosiy tushunchalarni o'rganish.\n`;
        plan += `- [ ] O'quv qo'llanmasidan tegishli mavzularni konspekt qilib, qiyin atamalarni eslab qolish.\n\n`;

        plan += `#### ⚡ 2-KUN: Amaliy mashg'ulotlar\n`;
        plan += `- [ ] Xato qilingan mavzular bo'yicha kamida 10-15 ta o'xshash mashq va testlarni mustaqil yechish.\n`;
        plan += `- [ ] Har bir to'g'ri javob mantiqini tushunib, tahlil qilish.\n\n`;

        plan += `#### 🚀 3-KUN: Sinov va mustahkamlash\n`;
        plan += `- [ ] Zukko platformasida ${subject} fani bo'yicha qaytadan test topshirish.\n`;
        plan += `- [ ] Barcha savollarni to'liq to'g'ri yechib, bilimingizni 100% natijaga olib chiqish!\n`;
    } else {
        plan += `#### 🏆 A'lo natija! Barcha savollarga to'liq to'g'ri javob berdingiz.\n\n`;
        plan += `### 🗓️ 3 Kunlik Ilg'or Rivojlanish Rejasi:\n\n`;
        plan += `#### 📌 1-KUN: Chuqurlashtirilgan mavzular\n`;
        plan += `- [ ] ${subject} fanining murakkab va olimpiada darajasidagi savollarini o'rganish.\n\n`;
        plan += `#### ⚡ 2-KUN: Tezlik va mahorat\n`;
        plan += `- [ ] Savollarni vaqtga qarab tezroq yechish ko'nikmasini shakllantirish.\n\n`;
        plan += `#### 🚀 3-KUN: Keyingi fanga o'tish\n`;
        plan += `- [ ] Boshqa turdosh fanlar testlarida o'z kuchingizni sinab ko'rish!`;
    }

    return plan;
}

router.post(
    "/ai/study-plan",
    async (
        req: Request<{}, {}, StudyPlanRequestBody>,
        res: Response,
    ): Promise<any> => {
        try {
            const { userId, category, scoreText, wrongAnswers } = req.body;

            if (!userId) {
                return res
                    .status(400)
                    .json({ message: "Foydalanuvchi identifikatori (userId) kiritilmadi." });
            }

            const subjectName = category || "Fan";
            const errorsList = Array.isArray(wrongAnswers) && wrongAnswers.length > 0
                ? wrongAnswers
                : [];

            const formattedErrors = errorsList
                .map(
                    (w, i) =>
                        `${i + 1}. Savol: "${w.question}"\n   Sizning javobingiz: "${w.userAnswer}"\n   To'g'ri javob: "${w.correctAnswer}"`,
                )
                .join("\n\n");

            const promptContent = errorsList.length > 0
                ? `Fan: ${subjectName}\nTest natijasi: ${scoreText}\n\nFoydalanuvchi yo'l qo'ygan xatolar:\n${formattedErrors}\n\nUshbu xatolar asosida foydalanuvchiga bilimidagi bo'shliqlarni to'ldirish uchun 3 kunlik batafsil, qiziqarli va professional o'quv rejasi (tavsiyalar, o'rganilishi kerak bo'lgan mavzular va maslahatlar) tuzib bering. Javobingizni chiroyli Markdown formatida, o'zbek tilida yozing.`
                : `Fan: ${subjectName}\nTest natijasi: ${scoreText}\n\nFoydalanuvchi barcha savollarga to'g'ri javob berdi! Unga bilimlarini yanada chuqurlashtirish va yuqori darajaga chiqish uchun 3 kunlik ilg'or tavsiyalar va o'quv rejasi tuzib bering. Markdown formatida, o'zbek tilida yozing.`;

            let planText = "";
            const apiKey = process.env.GROQ_API_KEY;

            if (apiKey) {
                const modelsToTry = await getActiveGroqModels(apiKey);
                for (const model of modelsToTry) {
                    try {
                        const response = await fetch(
                            "https://api.groq.com/openai/v1/chat/completions",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${apiKey.trim()}`,
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    model,
                                    messages: [
                                        {
                                            role: "system",
                                            content:
                                                "Siz Zukko platformasining tajribali, muloyim va rag'batlantiruvchi o'qituvchi-mentorisisiz. Foydalanuvchi xatolarini tahlil qilib, unga aniq 3 kunlik o'quv rejasi tuzib berasiz. Javobingizni Markdown formatida, o'zbek tilida yozing.",
                                        },
                                        {
                                            role: "user",
                                            content: promptContent,
                                        },
                                    ],
                                    temperature: 0.6,
                                    max_tokens: 1500,
                                }),
                            },
                        );

                        const data = await response.json();
                        if (response.ok && data.choices?.[0]?.message?.content) {
                            planText = data.choices[0].message.content.trim();
                            break;
                        }
                    } catch (modelErr) {
                        console.error(`Study plan model ${model} error:`, modelErr);
                    }
                }
            }

            // High-quality smart generator fallback
            if (!planText) {
                planText = generateSmartStudyPlan(subjectName, scoreText, errorsList);
            }

            // Save to database
            await dbPool.query(
                "INSERT INTO ai_plans (user_id, category, score, plan, is_read) VALUES ($1, $2, $3, $4, $5)",
                [String(userId), subjectName, scoreText, planText, false],
            );

            return res.json({
                success: true,
                message: "Reja muvaffaqiyatli tuzildi va saqlandi!",
                plan: planText,
            });
        } catch (error: any) {
            console.error("AI Study Plan xatolik:", error);
            return res
                .status(500)
                .json({ message: "AI rejasini saqlashda xatolik: " + (error.message || "") });
        }
    },
);

router.patch(
    "/ai/mark-as-read/:id",
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            await dbPool.query(
                "UPDATE ai_plans SET is_read = true WHERE id = $1",
                [id],
            );
            return res.json({ message: "Reja o'qildi deb belgilandi." });
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Bazani yangilashda xatolik." });
        }
    },
);

router.get(
    "/ai/my-plans/:userId",
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId } = req.params;
            const result = await dbPool.query(
                "SELECT * FROM ai_plans WHERE user_id = $1 ORDER BY created_at DESC",
                [userId],
            );
            return res.json(result.rows);
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Ma'lumotlarni yuklashda xatolik." });
        }
    },
);

router.post("/chat", async (req: Request, res: Response): Promise<any> => {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
            success: false,
            reply: "Iltimos, xabar matnini kiriting.",
        });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            success: false,
            reply: "AI xizmati vaqtincha sozlanmagan (GROQ_API_KEY topilmadi).",
        });
    }

    const SYSTEM_PROMPT = `Sen saytdagi aqlli AI-konsultantsan. Foydalanuvchi savollariga u yozgan tilda (o'zbek yoki rus tilida) muloyim, qisqa va aniq javob ber. Foydalanuvchi ehtiyojini aniqlab, qiziqish bildirsa, telefon raqami yoki aloqa ma'lumotlarini qoldirishni taklif qil. Platformadagi barcha kurslar, testlar, yo'nalishlar va ta'lim imkoniyatlari bo'yicha maslahat ber.`;

    const formattedMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
            role: "system",
            content: SYSTEM_PROMPT,
        },
    ];

    if (Array.isArray(history) && history.length > 0) {
        const validHistory = history
            .slice(-10) // keep last 10 messages for context
            .map((item) => ({
                role: item.role === "user" ? "user" : "assistant",
                content: String(item.content || item.text || ""),
            }))
            .filter((item) => item.content.trim().length > 0);

        formattedMessages.push(...(validHistory as any));
    }

    // Append current user message
    formattedMessages.push({
        role: "user",
        content: message.trim(),
    });

    const modelsToTry = await getActiveGroqModels(apiKey);

    let lastError: any = null;

    for (const model of modelsToTry) {
        try {
            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey.trim()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model,
                        messages: formattedMessages,
                        temperature: 0.6,
                        max_tokens: 1024,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                const errMsg = data.error?.message || JSON.stringify(data);
                console.error(`Groq API Error (${model}):`, errMsg);
                lastError = `${model}: ${errMsg}`;
                if (
                    errMsg.toLowerCase().includes("invalid api key") ||
                    errMsg.toLowerCase().includes("invalid_api_key") ||
                    errMsg.toLowerCase().includes("unauthorized")
                ) {
                    return res.status(401).json({
                        success: false,
                        reply: "⚠️ **Groq API kaliti yaroqsiz yoki muddati tugagan (Invalid API Key)**.\n\nIltimos, `backend/.env` faylidagi `GROQ_API_KEY` ni yangilang ([console.groq.com/keys](https://console.groq.com/keys) orqali yangi bepul kalit olishingiz mumkin).",
                        error: errMsg,
                    });
                }
                continue; // Try fallback model
            }

            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
                return res.json({
                    success: true,
                    reply: reply.trim(),
                });
            }
        } catch (err: any) {
            console.error(`Error with model ${model}:`, err);
            lastError = `${model}: ${err.message || "Ulanish xatosi"}`;
        }
    }

    // Try Gemini if configured
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        try {
            const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: SYSTEM_PROMPT + "\n\nFoydalanuvchi xabari: " + message }
                                ]
                            }
                        ]
                    })
                }
            );
            const geminiData = await geminiRes.json();
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                return res.json({
                    success: true,
                    reply: text.trim()
                });
            }
        } catch (gemErr) {
            console.error("Gemini fallback error:", gemErr);
        }
    }

    console.warn("AI Chat models failed, providing friendly consultant response:", lastError);
    return res.json({
        success: true,
        reply: `Assalomu alaykum! Men Zukko platformasining aqlli AI-konsultantiman. 🚀\n\nPlatformamizda fanlar bo'yicha testlarni topshirishingiz, bilim darajangizni tekshirishingiz va xatolaringiz asosida tuzilgan shaxsiy o'quv rejalarini Kabinetingizda kuzatib borishingiz mumkin.\n\nQanday savolingiz yoki yordam kerak bo'lgan yo'nalish bor?`,
    });
});

export default router;
