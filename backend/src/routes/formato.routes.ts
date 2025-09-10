import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createFormat, getFormat, getFormatById, updateFormat, deleteFormat } from "../controllers/formato.controller";

const router = Router();

router.post("/", authMiddleware, createFormat);
router.get("/", authMiddleware, getFormat);
router.get("/:id", authMiddleware, getFormatById);
router.put("/:id", authMiddleware, updateFormat);
router.delete("/:id", authMiddleware, deleteFormat);

export default router;