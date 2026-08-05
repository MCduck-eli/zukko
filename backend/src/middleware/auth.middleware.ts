import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "juda_maxfiy_kalit";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // Clerk orqali autentifikatsiya qilinganligini tekshiramiz
    const clerkAuth = (req as any).auth;
    if (clerkAuth && clerkAuth.userId) {
        (req as any).user = { id: clerkAuth.userId };
        return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Token topilmadi, ruxsat berilmaydi" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Token yaroqsiz yoki muddati o'tgan" });
    }
};
