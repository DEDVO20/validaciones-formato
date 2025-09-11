import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getMyNotifications } from '@/services/notifications';
import type { Notification } from '@/services/notifications';
import { isAuthenticated } from '@/services/auth';

interface UseRealtimeNotificationsOptions {
  pollInterval?: number; // Intervalo de polling en milisegundos
  enabled?: boolean; // Si está habilitado el polling
}

export function useRealtimeNotifications({
  pollInterval = 10000, // 10 segundos por defecto
  enabled = true
}: UseRealtimeNotificationsOptions = {}) {
  const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const checkForNewNotifications = async () => {
    if (!isAuthenticated() || !enabled) {
      return;
    }

    try {
      const notifications = await getMyNotifications();
      
      if (notifications.length === 0) {
        return;
      }

      // En la primera carga, solo guardamos el ID de la notificación más reciente
      if (!isInitialized.current) {
        const latestNotification = notifications[0];
        setLastNotificationId(latestNotification.id);
        isInitialized.current = true;
        return;
      }

      // Buscar notificaciones nuevas (no leídas y con ID mayor al último conocido)
      const newNotifications = notifications.filter(
        notification => 
          !notification.read && 
          (lastNotificationId === null || notification.id > lastNotificationId)
      );

      // Mostrar toasts para las nuevas notificaciones
      newNotifications.forEach(notification => {
        toast.info(notification.message, {
          duration: 8000,
          action: {
            label: 'Ver todas',
            onClick: () => {
              // Navegar a la página de notificaciones
              window.location.href = '/notifications';
            }
          },
          style: {
            border: '1px solid hsl(var(--primary))',
            backgroundColor: 'hsl(var(--background))',
          },
          className: 'notification-toast'
        });
      });

      // Actualizar el ID de la última notificación
      if (notifications.length > 0) {
        const latestNotification = notifications[0];
        setLastNotificationId(latestNotification.id);
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
      // No mostrar toast de error para no molestar al usuario
    }
  };

  const startPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Verificar inmediatamente
    checkForNewNotifications();
    
    // Configurar polling
    intervalRef.current = setInterval(checkForNewNotifications, pollInterval);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (enabled && isAuthenticated()) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, pollInterval]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    startPolling,
    stopPolling,
    checkForNewNotifications
  };
}