import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authMiddleware, getMyNotifications as any);
router.patch("/:id/read", authMiddleware, markNotificationRead as any);

export default router;
