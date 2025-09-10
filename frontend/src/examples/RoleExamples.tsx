import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleBasedAccess, usePermissions } from "@/components/RoleBasedAccess";
import { useAuth } from "@/hooks/useAuth";
import { Trash2, Edit, Plus, Eye, FileText, Users } from "lucide-react";

// Ejemplo 1: Botones condicionales basados en roles
export function ActionButtons() {
  const { canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions();
  
  return (
    <div className="flex gap-2">
      {/* Solo admin puede crear usuarios */}
      {canCreateUsers() && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      )}
      
      {/* Solo admin puede editar usuarios */}
      {canEditUsers() && (
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      )}
      
      {/* Solo admin puede eliminar usuarios */}
      {canDeleteUsers() && (
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      )}
    </div>
  );
}

// Ejemplo 2: Secciones completas basadas en roles
export function DashboardSections() {
  const { hasRole } = useAuth();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Todos los usuarios pueden ver esta sección */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Formularios</CardTitle>
          <CardDescription>Formularios que puedes completar</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Contenido disponible para todos los usuarios</p>
        </CardContent>
      </Card>
      
      {/* Solo validadores y admins pueden ver reportes */}
      <RoleBasedAccess allowedRoles={['validator', 'admin']}>
        <Card>
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Análisis y estadísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Ver Reportes
            </Button>
          </CardContent>
        </Card>
      </RoleBasedAccess>
      
      {/* Solo admins pueden gestionar usuarios */}
      <RoleBasedAccess 
        allowedRoles={['admin']}
        fallback={
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Acceso restringido</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No tienes permisos para esta sección</p>
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>Administrar usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Gestionar Usuarios
            </Button>
          </CardContent>
        </Card>
      </RoleBasedAccess>
    </div>
  );
}

// Ejemplo 3: Menú de navegación condicional
export function ConditionalNavigation() {
  const { hasRole } = useAuth();
  const { canViewReports, canCreateUsers, isAdmin } = usePermissions();
  
  const navigationItems = [
    // Siempre visible
    { label: "Dashboard", href: "/dashboard", icon: Eye, show: true },
    
    // Solo para validadores y admins
    { label: "Reportes", href: "/reports", icon: FileText, show: canViewReports() },
    
    // Solo para admins
    { label: "Usuarios", href: "/users", icon: Users, show: canCreateUsers() },
  ];
  
  return (
    <nav className="space-y-2">
      {navigationItems
        .filter(item => item.show)
        .map(item => (
          <Button key={item.href} variant="ghost" className="w-full justify-start">
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))
      }
    </nav>
  );
}

// Ejemplo 4: Información del usuario actual
export function UserRoleInfo() {
  const { user } = useAuth();
  const { getCurrentRole, isAdmin, canValidate } = usePermissions();
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'validator': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'validator': return 'Validador';
      case 'user': return 'Usuario';
      default: return 'Sin rol';
    }
  };
  
  const currentRole = getCurrentRole();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Nombre:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <strong>Rol:</strong>
            {currentRole && (
              <Badge className={getRoleColor(currentRole)}>
                {getRoleLabel(currentRole)}
              </Badge>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-2">Permisos:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <span className={isAdmin() ? 'text-green-600' : 'text-red-600'}>
                {isAdmin() ? '✓' : '✗'}
              </span>
              Administrador del sistema
            </li>
            <li className="flex items-center gap-2">
              <span className={canValidate() ? 'text-green-600' : 'text-red-600'}>
                {canValidate() ? '✓' : '✗'}
              </span>
              Puede validar formularios
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Puede completar formularios
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Ejemplo 5: Hook personalizado para lógica compleja
export function useAdvancedPermissions() {
  const { hasRole, user } = useAuth();
  
  return {
    // Verificar si puede acceder a una ruta específica
    canAccessRoute: (route: string) => {
      const routePermissions: Record<string, string[]> = {
        '/users': ['admin'],
        '/reports': ['admin', 'validator'],
        '/dashboard': ['admin', 'validator', 'user'],
        '/profile': ['admin', 'validator', 'user'],
      };
      
      const requiredRoles = routePermissions[route];
      return requiredRoles ? hasRole(requiredRoles) : false;
    },
    
    // Verificar si puede realizar una acción específica
    canPerformAction: (action: string, resourceType?: string) => {
      const actionPermissions: Record<string, string[]> = {
        'create_user': ['admin'],
        'edit_user': ['admin'],
        'delete_user': ['admin'],
        'view_reports': ['admin', 'validator'],
        'create_format': ['admin', 'validator'],
        'complete_form': ['admin', 'validator', 'user'],
      };
      
      const requiredRoles = actionPermissions[action];
      return requiredRoles ? hasRole(requiredRoles) : false;
    },
    
    // Obtener acciones disponibles para el usuario actual
    getAvailableActions: () => {
      const allActions = [
        { key: 'create_user', label: 'Crear usuarios', roles: ['admin'] },
        { key: 'edit_user', label: 'Editar usuarios', roles: ['admin'] },
        { key: 'delete_user', label: 'Eliminar usuarios', roles: ['admin'] },
        { key: 'view_reports', label: 'Ver reportes', roles: ['admin', 'validator'] },
        { key: 'create_format', label: 'Crear formatos', roles: ['admin', 'validator'] },
        { key: 'complete_form', label: 'Completar formularios', roles: ['admin', 'validator', 'user'] },
      ];
      
      return allActions.filter(action => hasRole(action.roles));
    },
  };
}