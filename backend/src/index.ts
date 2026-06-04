import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import questionRoute from "./routes/question-route.js";

const app = express();
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", questionRoute);
app.use((req, res) => {
    res.status(404).send({ message: "Bunday yo'l mavjud emas (404)" });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli yondi`);
});
