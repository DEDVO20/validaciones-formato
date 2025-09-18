import React, { createContext, useContext } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { isAuthenticated } from '@/services/auth';

interface NotificationContextType {
  checkForNewNotifications: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { checkForNewNotifications, startPolling, stopPolling } = useRealtimeNotifications({
    pollInterval: 15000, // Verificar cada 15 segundos
    enabled: isAuthenticated() // Solo habilitar si está autenticado
  });

  const contextValue: NotificationContextType = {
    checkForNewNotifications,
    startPolling,
    stopPolling
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}