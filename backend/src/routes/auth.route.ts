import { Router } from "express";
import {
    registerController,
    loginController,
    verifyController,
} from "../controller/auth-controller.js";
import { getDashboard } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify", verifyController);
router.get("/dashboard", authMiddleware, getDashboard);

export default router;
