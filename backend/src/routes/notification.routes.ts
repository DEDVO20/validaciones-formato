import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getMyNotifications,
  markNotificationRead,
  getNotificationStats,
  runManualCleanup,
  runTestCleanup,
  testCleanupPublic,
} from "../controllers/notification.controller";

const router = Router();

// Rutas existentes
router.get("/", authMiddleware, getMyNotifications as any);
router.patch("/:id/read", authMiddleware, markNotificationRead as any);

// Nuevas rutas para limpieza y estadísticas
router.get("/stats", authMiddleware, getNotificationStats as any);
router.post("/cleanup", authMiddleware, runManualCleanup as any);
router.post("/test-cleanup", authMiddleware, runTestCleanup as any);

// Ruta pública para pruebas (sin autenticación)
router.post("/test-public", testCleanupPublic as any);

export default router;
