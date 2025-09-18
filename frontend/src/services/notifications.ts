import { getAuthToken } from './auth';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// Obtener todas las notificaciones del usuario actual
export async function getMyNotifications(): Promise<Notification[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('/api/notifications', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al obtener notificaciones' }));
      throw new Error(errorData.message || 'Error al obtener notificaciones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al obtener notificaciones');
  }
}

// Marcar una notificación como leída
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error al marcar notificación como leída' }));
      throw new Error(errorData.message || 'Error al marcar notificación como leída');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de red al marcar notificación como leída');
  }
}

// Obtener el número de notificaciones no leídas
export async function getUnreadNotificationsCount(): Promise<number> {
  try {
    const notifications = await getMyNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}