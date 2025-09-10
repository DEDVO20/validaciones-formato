import { Router } from "express";
import { descargarPDF, previsualizarPDF, previsualizarPDFValidado } from "../controllers/pdf.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Endpoints de previsualización en base64
router.get("/preview-base64/:completionId", authMiddleware, previsualizarPDF);
router.get("/preview-validated/:completionId", authMiddleware, previsualizarPDFValidado);

// Descarga oficial del PDF aprobado
router.get("/download/:completionId", authMiddleware, descargarPDF);

export default router;
