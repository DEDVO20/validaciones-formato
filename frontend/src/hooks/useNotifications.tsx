import { useState, useEffect } from 'react';
import { getUnreadNotificationsCount, getMyNotifications, markNotificationAsRead } from '@/services/notifications';
import type { Notification } from '@/services/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyNotifications();
      setNotifications(data);
      // Actualizar el contador basado en las notificaciones obtenidas
      const unreadCount = data.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      setMarkingAsRead(notificationId);
      await markNotificationAsRead(notificationId);
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      // Actualizar el contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    } finally {
      setMarkingAsRead(null);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Actualizar el contador cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markingAsRead,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    refetch: fetchNotifications
  };
}