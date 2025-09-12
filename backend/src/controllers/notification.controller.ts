import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { getUserNotifications, markAsRead } from "../utils/notification.service";
import { NotificationCleanupService } from "../utils/notificationCleanup.service";
import { CronJobService } from "../utils/cronJobs";

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

// Obtener estadísticas de notificaciones
export const getNotificationStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await NotificationCleanupService.getNotificationStats();
    const cronStatus = CronJobService.getJobsStatus();
    
    res.json({
      statistics: stats,
      cronJobs: cronStatus,
      lastCleanup: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: "Error al obtener estadísticas de notificaciones" });
  }
};

// Ejecutar limpieza manual de notificaciones
export const runManualCleanup = async (req: AuthRequest, res: Response) => {
  try {
    const deletedCount = await NotificationCleanupService.cleanupOldReadNotifications();
    const statsAfter = await NotificationCleanupService.getNotificationStats();
    
    res.json({
      success: true,
      deletedCount,
      message: `Se eliminaron ${deletedCount} notificaciones leídas antiguas`,
      currentStats: statsAfter
    });
  } catch (error) {
    console.error('Error en limpieza manual:', error);
    res.status(500).json({ error: "Error al ejecutar limpieza de notificaciones" });
  }
};

// Ejecutar limpieza de prueba (para testing)
export const runTestCleanup = async (req: AuthRequest, res: Response) => {
  try {
    CronJobService.scheduleTestCleanup();
    res.json({
      success: true,
      message: "Limpieza de prueba programada para ejecutarse en 1 minuto"
    });
  } catch (error) {
    console.error('Error programando limpieza de prueba:', error);
    res.status(500).json({ error: "Error al programar limpieza de prueba" });
  }
};

// Endpoint público para probar la funcionalidad (sin autenticación)
export const testCleanupPublic = async (req: any, res: Response) => {
  try {
    console.log('🧪 Ejecutando prueba de limpieza...');
    
    // Obtener estadísticas antes
    const statsBefore = await NotificationCleanupService.getNotificationStats();
    
    // Ejecutar limpieza
    const deletedCount = await NotificationCleanupService.cleanupOldReadNotifications();
    
    // Obtener estadísticas después
    const statsAfter = await NotificationCleanupService.getNotificationStats();
    
    // Estado de cron jobs
    const cronStatus = CronJobService.getJobsStatus();
    
    res.json({
      success: true,
      message: 'Prueba de limpieza ejecutada exitosamente',
      results: {
        deletedCount,
        statsBefore,
        statsAfter,
        cronJobs: cronStatus
      }
    });
  } catch (error) {
     console.error('Error en prueba de limpieza:', error);
     res.status(500).json({ 
       error: "Error al ejecutar prueba de limpieza",
       details: error instanceof Error ? error.message : 'Error desconocido'
     });
   }
 };
