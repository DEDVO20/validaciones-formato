import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ActionButtons, 
  DashboardSections, 
  ConditionalNavigation, 
  UserRoleInfo,
  useAdvancedPermissions 
} from "@/examples/RoleExamples";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export default function RoleDemoPage() {
  const { hasRole } = useAuth();
  const { getAvailableActions, canAccessRoute } = useAdvancedPermissions();
  
  const availableActions = getAvailableActions();
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Demostración de Control de Acceso por Roles</h1>
        <p className="text-muted-foreground">
          Esta página muestra cómo usar <code className="bg-muted px-1 py-0.5 rounded">hasRole</code> para controlar el acceso basado en roles de usuario.
        </p>
      </div>
      
      <Separator />
      
      {/* Información del usuario actual */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Información del Usuario Actual</h2>
        <UserRoleInfo />
      </section>
      
      <Separator />
      
      {/* Ejemplos de uso básico */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Uso Básico de hasRole</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Verificaciones Simples</CardTitle>
              <CardDescription>Ejemplos básicos de verificación de roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>¿Es administrador?</span>
                <Badge variant={hasRole(['admin']) ? 'default' : 'secondary'}>
                  {hasRole(['admin']) ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>¿Puede validar?</span>
                <Badge variant={hasRole(['validator', 'admin']) ? 'default' : 'secondary'}>
                  {hasRole(['validator', 'admin']) ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>¿Es usuario básico?</span>
                <Badge variant={hasRole(['user']) ? 'default' : 'secondary'}>
                  {hasRole(['user']) ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>¿Puede crear formatos?</span>
                <Badge variant={hasRole(['admin']) ? 'default' : 'secondary'}>
                  {hasRole(['admin']) ? 'Sí' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>¿Puede completar formularios?</span>
                <Badge variant={hasRole(['user', 'admin']) ? 'default' : 'secondary'}>
                  {hasRole(['user', 'admin']) ? 'Sí' : 'No'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Código de Ejemplo</CardTitle>
              <CardDescription>Cómo implementar estas verificaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`const { hasRole } = useAuth();

// Verificar un rol específico
if (hasRole(['admin'])) {
  // Solo admins pueden ver esto
}

// Verificar múltiples roles
if (hasRole(['validator', 'admin'])) {
  // Validadores y admins pueden ver esto
}

// Permisos específicos actualizados
if (hasRole(['admin'])) {
  // Solo admins pueden crear formatos
}

if (hasRole(['user', 'admin'])) {
  // Usuarios y admins pueden completar formularios
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Separator />
      
      {/* Botones condicionales */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Botones Condicionales</h2>
        <Card>
          <CardHeader>
            <CardTitle>Acciones Basadas en Roles</CardTitle>
            <CardDescription>Los botones aparecen según los permisos del usuario</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionButtons />
          </CardContent>
        </Card>
      </section>
      
      <Separator />
      
      {/* Secciones condicionales */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Secciones Condicionales</h2>
        <p className="text-muted-foreground">
          Diferentes secciones del dashboard según el rol del usuario:
        </p>
        <DashboardSections />
      </section>
      
      <Separator />
      
      {/* Navegación condicional */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Navegación Condicional</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Menú de Navegación</CardTitle>
              <CardDescription>Solo muestra opciones permitidas</CardDescription>
            </CardHeader>
            <CardContent>
              <ConditionalNavigation />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Acceso a Rutas</CardTitle>
              <CardDescription>Verificación de acceso por ruta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {['/dashboard', '/users', '/reports'].map(route => (
                <div key={route} className="flex items-center justify-between">
                  <code className="text-sm">{route}</code>
                  <Badge variant={canAccessRoute(route) ? 'default' : 'secondary'}>
                    {canAccessRoute(route) ? 'Permitido' : 'Denegado'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Separator />
      
      {/* Acciones disponibles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Acciones Disponibles</h2>
        <Card>
          <CardHeader>
            <CardTitle>Permisos del Usuario Actual</CardTitle>
            <CardDescription>Todas las acciones que puedes realizar</CardDescription>
          </CardHeader>
          <CardContent>
            {availableActions.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {availableActions.map(action => (
                  <Badge key={action.key} variant="outline" className="justify-center p-2">
                    {action.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay acciones disponibles para tu rol.</p>
            )}
          </CardContent>
        </Card>
      </section>
      
      <Separator />
      
      {/* Validaciones de Seguridad */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Validaciones de Seguridad</h2>
        <Card>
          <CardHeader>
            <CardTitle>Validaciones de Contraseña</CardTitle>
            <CardDescription>Controles implementados para el cambio de contraseñas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span>Campos obligatorios: No se permiten campos vacíos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span>Longitud mínima: 6 caracteres para nuevas contraseñas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span>Verificación: La contraseña actual debe ser correcta</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span>Confirmación: Nueva contraseña y repetición deben coincidir</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">✓</Badge>
                <span>Diferenciación: Nueva contraseña debe ser distinta a la actual</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <Separator />
      
      {/* Ejemplos de código */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Ejemplos de Implementación</h2>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Componente RoleBasedAccess</CardTitle>
              <CardDescription>Wrapper para mostrar contenido condicional</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { RoleBasedAccess } from '@/components/RoleBasedAccess';

// Mostrar contenido solo para admins
<RoleBasedAccess allowedRoles={['admin']}>
  <Button>Solo admins ven esto</Button>
</RoleBasedAccess>

// Con fallback para usuarios sin permisos
<RoleBasedAccess 
  allowedRoles={['admin']} 
  fallback={<p>No tienes permisos</p>}
>
  <Button>Acción de admin</Button>
</RoleBasedAccess>`}
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hook usePermissions</CardTitle>
              <CardDescription>Funciones predefinidas para verificaciones comunes</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { usePermissions } from '@/components/RoleBasedAccess';

function MyComponent() {
  const { 
    isAdmin, 
    canValidate, 
    canCreateUsers,
    canViewReports 
  } = usePermissions();
  
  return (
    <div>
      {isAdmin() && <AdminPanel />}
      {canValidate() && <ValidationTools />}
      {canViewReports() && <ReportsSection />}
    </div>
  );
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}