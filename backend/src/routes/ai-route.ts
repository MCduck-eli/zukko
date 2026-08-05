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

router.post("/chat", async (req, res) => {
    const { message } = req.body;
    try {
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
                                "Siz Zukko tizimining komandirisiz. Juda aqlli, hazilkash, optimist va o'quvchilarni ruhlantiradigan yordamchisiz.",
                        },
                        { role: "user", content: message },
                    ],
                    temperature: 0.7,
                }),
            },
        );

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Groq API Error:", data);
            throw new Error(data.error?.message || "Groq API Error");
        }

        res.json({ reply: data.choices[0].message.content });
    } catch (error: any) {
        console.error("AI Chat xatolik:", error);
        res.status(500).json({
            reply: "Sistemamda kichik portlash sodir bo'ldi. Xatolik: " + (error.message || "Noma'lum xato"),
        });
    }
});

export default router;
