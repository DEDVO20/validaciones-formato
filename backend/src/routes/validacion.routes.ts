import { Router } from "express";
import { validationCompletion, listValidations, getPendingValidations, getValidationByCompletion, updateValidation } from "../controllers/validation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, validationCompletion);
router.get("/", authMiddleware, listValidations);
router.get("/pending", authMiddleware, getPendingValidations);
router.get("/completion/:completionId", authMiddleware, getValidationByCompletion);
router.put("/:id", authMiddleware, updateValidation);

export default router;
