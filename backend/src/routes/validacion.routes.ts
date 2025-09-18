import { Router } from "express";
import { validationCompletion, listValidations, getPendingValidations, getCompletedValidations, getValidationByCompletion, updateValidation } from "../controllers/validation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, validationCompletion as any);
router.get("/", authMiddleware, listValidations as any);
router.get("/pending", authMiddleware, getPendingValidations as any);
router.get("/completed", authMiddleware, getCompletedValidations as any);
router.get("/completion/:completionId", authMiddleware, getValidationByCompletion as any);
router.put("/:id", authMiddleware, updateValidation as any);

export default router;
