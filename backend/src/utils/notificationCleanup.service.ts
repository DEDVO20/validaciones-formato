import { Notification } from '../models/notification.model';
import { Op } from 'sequelize';

export class NotificationCleanupService {
  /**
   * Elimina notificaciones que tengan más de 7 días (independientemente de si están leídas o no)
   */
  static async cleanupOldReadNotifications(): Promise<number> {
    try {
      // Calcular fecha límite (7 días atrás)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Eliminar notificaciones más antiguas que 7 días
      const deletedCount = await Notification.destroy({
        where: {
          updatedAt: {
            [Op.lt]: sevenDaysAgo
          }
        }
      });

      console.log(`🧹 Limpieza de notificaciones: ${deletedCount} notificaciones eliminadas`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error en limpieza de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de notificaciones antes de la limpieza
   */
  static async getNotificationStats(): Promise<{
    total: number;
    read: number;
    unread: number;
    oldRead: number;
  }> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [total, read, unread, oldRead] = await Promise.all([
        Notification.count(),
        Notification.count({ where: { read: true } }),
        Notification.count({ where: { read: false } }),
        Notification.count({
          where: {
            updatedAt: {
              [Op.lt]: sevenDaysAgo
            }
          }
        })
      ]);

      return { total, read, unread, oldRead };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de notificaciones:', error);
      throw error;
    }
  }

  /**
   * Ejecuta limpieza con logging detallado
   */
  static async runCleanupWithLogging(): Promise<void> {
    try {
      console.log('🔍 Iniciando limpieza de notificaciones...');
      
      // Obtener estadísticas antes de la limpieza
      const statsBefore = await this.getNotificationStats();
      console.log('📊 Estadísticas antes de limpieza:', {
        total: statsBefore.total,
        leídas: statsBefore.read,
        noLeídas: statsBefore.unread,
        antiguas: statsBefore.oldRead
      });

      // Ejecutar limpieza
      const deletedCount = await this.cleanupOldReadNotifications();

      // Obtener estadísticas después de la limpieza
      const statsAfter = await this.getNotificationStats();
      console.log('📊 Estadísticas después de limpieza:', {
        total: statsAfter.total,
        leídas: statsAfter.read,
        noLeídas: statsAfter.unread,
        eliminadas: deletedCount
      });

      console.log('✅ Limpieza de notificaciones completada exitosamente');
    } catch (error) {
      console.error('❌ Error en limpieza de notificaciones:', error);
    }
  }
}