import { Request, Response } from "express";
import { QuestionService } from "../service/question-service.js";

const questionService = new QuestionService();

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { category, limit } = req.query;
        const questions = await questionService.getRandomQuestions(
            category as string,
            limit ? parseInt(limit as string) : 10,
        );

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions,
        });
    } catch (error) {
        console.error("Savollarni olishda xato:", error);
        res.status(500).json({
            success: false,
            message: "Serverda xatolik yuz berdi",
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
