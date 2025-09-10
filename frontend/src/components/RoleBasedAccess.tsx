import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

// Componente para mostrar contenido basado en roles
interface RoleBasedAccessProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleBasedAccess({ allowedRoles, children, fallback = null }: RoleBasedAccessProps) {
  const { hasRole } = useAuth();
  
  if (hasRole(allowedRoles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Hook personalizado para verificar permisos específicos
export function usePermissions() {
  const { hasRole, user } = useAuth();
  
  return {
    // Verificar si es administrador
    isAdmin: () => hasRole(['admin']),
    
    // Verificar si es validador o admin
    canValidate: () => hasRole(['validator', 'admin']),
    
    // Verificar si puede crear usuarios (solo admin)
    canCreateUsers: () => hasRole(['admin']),
    
    // Verificar si puede editar usuarios
    canEditUsers: () => hasRole(['admin']),
    
    // Verificar si puede eliminar usuarios
    canDeleteUsers: () => hasRole(['admin']),
    
    // Verificar si puede ver reportes
    canViewReports: () => hasRole(['admin', 'validator']),
    
    // Verificar si puede crear formatos
    canCreateFormats: () => hasRole(['admin', 'validator']),
    
    // Verificar si puede editar formatos
    canEditFormats: () => hasRole(['admin']),
    
    // Verificar si puede completar formularios
    canCompleteForm: () => hasRole(['user', 'validator', 'admin']),
    
    // Obtener el rol actual
    getCurrentRole: () => user?.role || null,
    
    // Verificar múltiples roles
    hasAnyRole: (roles: string[]) => hasRole(roles),
  };
}