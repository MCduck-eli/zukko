import { Router } from "express";
import express from "express";
import { Webhook } from "svix";
import {
    registerController,
    loginController,
    verifyController,
} from "../controller/auth-controller.js";
import { getDashboard } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authService } from "../service/auth-service.js";

const router = Router();

router.post(
    "/clerk-webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!SIGNING_SECRET) {
            return res
                .status(500)
                .json({ error: "CLERK_WEBHOOK_SECRET sozlanmagan" });
        }

        const payload = req.body;
        const headers = req.headers;

        const svix_id = headers["svix-id"] as string;
        const svix_timestamp = headers["svix-timestamp"] as string;
        const svix_signature = headers["svix-signature"] as string;

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res
                .status(400)
                .json({ error: "Svix sarlavhalari etishmayapti" });
        }

        const wh = new Webhook(SIGNING_SECRET);
        let evt: any;

        try {
            evt = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error("Webhook imzosi tasdiqlanmadi:", err);
            return res.status(400).json({ error: "Xato webhook imzosi" });
        }

        const eventType = evt.type;

        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const primaryEmail = email_addresses?.[0]?.email_address;
            const fullName = `${first_name || ""} ${last_name || ""}`.trim();

            if (primaryEmail) {
                try {
                    await authService.syncClerkUser(id, primaryEmail, fullName);
                    console.log(
                        `✅ Clerk foydalanuvchisi bazaga saqlandi: ${primaryEmail}`,
                    );
                } catch (dbError) {
                    console.error("Bazaga saqlashda xatolik:", dbError);
                    return res
                        .status(500)
                        .json({ error: "Baza bilan bog'liq xatolik" });
                }
            }
        }

        return res.status(200).json({ success: true });
    },
);

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify", verifyController);
router.get("/dashboard", authMiddleware, getDashboard);

export default router;
