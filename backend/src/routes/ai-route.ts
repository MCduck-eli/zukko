import express, { Request, Response, Router } from "express";
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const router: Router = express.Router();

const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
const dbClient = new Client({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

dbClient
    .connect()
    .catch((err) => console.error("DBga ulanishda xatolik:", err));

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

router.post(
    "/ai/study-plan",
    async (
        req: Request<{}, {}, StudyPlanRequestBody>,
        res: Response,
    ): Promise<any> => {
        try {
            const { userId, category, scoreText, wrongAnswers } = req.body;

            if (
                !userId ||
                !wrongAnswers ||
                !Array.isArray(wrongAnswers) ||
                wrongAnswers.length === 0
            ) {
                return res
                    .status(400)
                    .json({ message: "Ma'lumotlar to'liq emas." });
            }

            const formattedErrors = wrongAnswers
                .map(
                    (w, i) =>
                        `${i + 1}. Savol: "${w.question}"\n   Siz: "${w.userAnswer}"\n   To'g'risi: "${w.correctAnswer}"`,
                )
                .join("\n\n");

            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "system",
                                content:
                                    "Siz tajribali o'qituvchisiz. Javobingizni Markdown formatida, o'zbek tilida yozing.",
                            },
                            {
                                role: "user",
                                content: `Fan: ${category || "Fan"}\nTest natijasi: ${scoreText}\nXatolar:\n${formattedErrors}\n\nUshbu xatolar asosida 3 kunlik o'quv rejasi tuzing.`,
                            },
                        ],
                        temperature: 0.6,
                    }),
                },
            );

            const data = await response.json();
            
            if (!response.ok) {
                console.error("Groq API Error (Study Plan):", data);
                throw new Error(data.error?.message || "Groq API Error");
            }
            
            const text = data.choices[0].message.content;

            await dbClient.query(
                "INSERT INTO ai_plans (user_id, category, score, plan, is_read) VALUES ($1, $2, $3, $4, $5)",
                [userId, category || "Fan", scoreText, text, false],
            );

            return res.json({ message: "Reja muvaffaqiyatli saqlandi!" });
        } catch (error: any) {
            console.error("AI Study Plan xatolik:", error);
            return res
                .status(500)
                .json({ message: "AI xizmatida xatolik yuz berdi: " + (error.message || "") });
        }
    },
);

router.patch(
    "/ai/mark-as-read/:id",
    async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            await dbClient.query(
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
            const result = await dbClient.query(
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

    const modelsToTry = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it"
    ];

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
                lastError = errMsg;
                if (errMsg.toLowerCase().includes("invalid api key") || errMsg.toLowerCase().includes("invalid_api_key") || errMsg.toLowerCase().includes("unauthorized")) {
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
            lastError = err.message || "Ulanish xatosi";
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

    console.error("AI Chat barcha modellarda xatolik:", lastError);
    return res.status(500).json({
        success: false,
        reply: `⚠️ AI xizmatidan javob olishda xatolik yuz berdi: ${lastError || "Noma'lum xatolik"}. Iltimos, birozdan so'ng qayta urinib ko'ring yoki API kalitni tekshiring.`,
        error: lastError,
    });
});

export default router;
