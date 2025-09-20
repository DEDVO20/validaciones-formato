import { Router } from "express";
import userRoutes from "./user.routes";
import formatRoutes from "./formato.routes";
import completionRoutes from "./completion.routes";
import validationRoutes from "./validacion.routes";
import pdfRoutes from "./pdf.routes";
import { logout } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import notificationRoutes from "./notification.routes";
import statsRoutes from "./stats.routes";

const router = Router();

// Rutas de usuarios
router.use("/users", userRoutes);

// Rutas de formatos
router.use("/formats", formatRoutes);

// Rutas de diligenciamientos
router.use("/completions", completionRoutes);

// Rutas de submissions
// router.use("/submissions", submissionsRoutes);

// Rutas de validaciones
router.use("/validations", validationRoutes);

// Rutas de PDF
router.use("/pdf", pdfRoutes);

// Ruta directa de logout
router.post("/logout", authMiddleware, logout);

// Rutas de notificaciones
router.use("/notifications", notificationRoutes);

// Rutas de estadísticas
router.use("/stats", statsRoutes);

export default router;
