import { Router } from "express";
import { getQuestions } from "../controller/question-controller.js";

const router = Router();

/**
 * @route
 * @desc
 * @access
 */
router.get("/questions", getQuestions);

export default router;
