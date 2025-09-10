import { Router } from "express";
import { createSubmission, getSubmission, updateSubmission, getAllSubmissions, getUserSubmissions,getPendingSubmissions,updateSubmissionStatus } from "../controllers/submissions.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createSubmission);
router.get("/", authMiddleware, getAllSubmissions);
router.get("/:id", authMiddleware, getSubmission);
router.put("/:id", authMiddleware, updateSubmission);

router.get("/mine", authMiddleware, getUserSubmissions);
router.get("/pending", authMiddleware, getPendingSubmissions);
router.patch("/:id/status", authMiddleware, updateSubmissionStatus);


export default router;