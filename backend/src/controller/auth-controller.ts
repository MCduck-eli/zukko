import { Request, Response } from "express";
import { authService } from "../service/auth-service.js";

export const registerController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const user = await authService.register(req.body);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({
            message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
            user: userWithoutPassword,
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(400).json({
                message: "Bu email allaqachon ro'yxatdan o'tgan",
            });
            return;
        }
        res.status(500).json({ message: "Serverda xatolik yuz berdi" });
    }
};
export const loginController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const result = await authService.login(req.body);

        if (!result) {
            res.status(401).json({ message: "Email yoki parol xato!" });
            return;
        }
        const { password, ...userWithoutPassword } = result.user;
        res.status(200).json({
            message: "Xush kelibsiz",
            user: userWithoutPassword,
            token: result.token,
        });
    } catch (error) {
        res.status(500).json({ message: "Serverda xatolik yuz berdi" });
    }
};
