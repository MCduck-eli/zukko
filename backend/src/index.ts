import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import questionRoute from "./routes/question-route.js";
import aiRoute from "./routes/ai-route.js";
import { clerkMiddleware } from "@clerk/express";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use("/api/auth", authRoutes);

app.use(express.json());
app.use(
    clerkMiddleware({
        publishableKey:
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
            process.env.CLERK_PUBLISHABLE_KEY,
    }),
);

app.use("/api", questionRoute);
app.use("/api", aiRoute);

app.use((req, res) => {
    res.status(404).send({ message: "Bunday yo'l mavjud emas (404)" });
});

if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli yondi`);
    });
}

export default app;
