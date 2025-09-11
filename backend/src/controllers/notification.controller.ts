import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { getUserNotifications, markAsRead } from "../utils/notification.service";

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id as number; // viene del authMiddleware
    const notifications = await getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await markAsRead(Number(id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar notificación" });
  }
};
