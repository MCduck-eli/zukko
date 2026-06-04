import { Request, Response } from "express";

export const getDashboard = (req: Request, res: Response) => {
    const userData = (req as any).user;
    res.status(200).json({
        message: "Dashboardga xush kelibsiz!",
        userInfo: userData,
    });
};
