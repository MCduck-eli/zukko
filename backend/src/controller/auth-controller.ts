import { Request, Response } from "express";
import { authService, createTablesIfNotExist } from "../service/auth-service.js";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const isLocal =
    !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@127.0.0.1:5432/template1",
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

export const registerController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { email } = req.body;

        await createTablesIfNotExist();

        const checkUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email],
        );
        const existingUser = checkUser.rows[0];

        if (existingUser) {
            if (!existingUser.is_verified) {
                const newCode = Math.floor(
                    100000 + Math.random() * 900000,
                ).toString();
                const newExpiry = new Date(Date.now() + 10 * 60 * 1000);
                await pool.query(
                    "UPDATE users SET verification_code = $1, code_expires_at = $2 WHERE id = $3",
                    [newCode, newExpiry, existingUser.id],
                );
                await authService.sendVerificationEmail(
                    existingUser.email,
                    newCode,
                );

                res.status(200).json({
                    message:
                        "Emailingiz hali tasdiqlanmagan. Yangi kod yuborildi!",
                    email: existingUser.email,
                });
                return;
            } else {
                res.status(400).json({
                    message:
                        "Bu email allaqachon ro'yxatdan o'tgan va tasdiqlangan!",
                });
                return;
            }
        }
        const user = await authService.register(req.body);
        res.status(201).json({
            message:
                "Emailingizga tasdiqlash kodi yuborildi. Iltimos, kodni kiriting.",
            email: user.email,
        });
    } catch (error: any) {
        if (error.code === "23505" || error.code === "P2002") {
            res.status(400).json({
                message: "Bu email allaqachon ro'yxatdan o'tgan",
            });
            return;
        }
        console.error("REGISTRATSIYADA ANIQ XATOLIK:", error);
        res.status(500).json({
            message: "Serverda xatolik yuz berdi",
            details: error.message || error,
        });
    }
};

export const verifyController = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { email, code } = req.body;
        const result = await authService.verifyCode(email, code);

        if (!result) {
            res.status(400).json({
                message: "Tasdiqlash kodi xato yoki muddati o'tgan!",
            });
            return;
        }

        res.status(200).json({
            message:
                "Emailingiz muvaffaqiyatli tasdiqlandi! Endi tizimga kirishingiz mumkin.",
            user: result.user,
            token: result.token,
        });
    } catch (error: any) {
        console.error("VERIFYDA ANIQ XATOLIK:", error);
        res.status(500).json({
            message: "Serverda xatolik yuz berdi",
            details: error.message || error,
        });
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

        if (result.status === "unverified") {
            res.status(403).json({
                message:
                    "Emailingiz hali tasdiqlanmagan! Iltimos, kodni kiriting.",
                status: "unverified",
                email: result.email,
            });
            return;
        }

        res.status(200).json({
            message: "Xush kelibsiz",
            user: result.user,
            token: result.token,
        });
    } catch (error: any) {
        console.error("LOGINDA ANIQ XATOLIK:", error);
        res.status(500).json({
            message: "Serverda xatolik yuz berdi",
            details: error.message || error,
        });
    }
};
