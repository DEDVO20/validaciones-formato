# Guía de Control de Acceso por Roles

Esta guía explica cómo usar el sistema de roles y la función `hasRole` en la aplicación.

## Roles Disponibles

La aplicación maneja tres tipos de roles:

- **`user`** - Usuario básico que puede completar formularios
- **`validator`** - Validador que puede revisar y aprobar formularios, además de ver reportes
- **`admin`** - Administrador con acceso completo al sistema

## Hook useAuth

El hook `useAuth` proporciona la función `hasRole` para verificar permisos:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { hasRole, user } = useAuth();
  
  // Verificar si el usuario tiene un rol específico
  const isAdmin = hasRole(['admin']);
  
  // Verificar múltiples roles
  const canValidate = hasRole(['validator', 'admin']);
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canValidate && <ValidationTools />}
    </div>
  );
}
```

## Componente RoleBasedAccess

Usa este componente para mostrar contenido condicional:

```tsx
import { RoleBasedAccess } from '@/components/RoleBasedAccess';

// Mostrar contenido solo para roles específicos
<RoleBasedAccess allowedRoles={['admin']}>
  <Button>Solo admins pueden ver esto</Button>
</RoleBasedAccess>

// Con contenido alternativo para usuarios sin permisos
<RoleBasedAccess 
  allowedRoles={['admin', 'validator']}
  fallback={<p>No tienes permisos para esta acción</p>}
>
  <ReportsSection />
</RoleBasedAccess>
```

## Hook usePermissions

Proporciona funciones predefinidas para verificaciones comunes:

```tsx
import { usePermissions } from '@/components/RoleBasedAccess';

function MyComponent() {
  const {
    isAdmin,
    canValidate,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canViewReports,
    canCreateFormats,
    canEditFormats,
    canCompleteForm,
    getCurrentRole,
    hasAnyRole
  } = usePermissions();
  
  return (
    <div>
      {isAdmin() && <AdminDashboard />}
      {canViewReports() && <ReportsLink />}
      {canCreateUsers() && <CreateUserButton />}
    </div>
  );
}
```

## Ejemplos Prácticos

### 1. Botones Condicionales

```tsx
function ActionButtons() {
  const { hasRole } = useAuth();
  
  return (
    <div className="flex gap-2">
      {hasRole(['admin']) && (
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Usuario
        </Button>
      )}
      
      {hasRole(['admin', 'validator']) && (
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Ver Reportes
        </Button>
      )}
    </div>
  );
}
```

### 2. Navegación Condicional

```tsx
function Navigation() {
  const { hasRole } = useAuth();
  
  const navItems = [
    { label: "Dashboard", href: "/dashboard", roles: ['user', 'validator', 'admin'] },
    { label: "Reportes", href: "/reports", roles: ['validator', 'admin'] },
    { label: "Usuarios", href: "/users", roles: ['admin'] },
  ];
  
  return (
    <nav>
      {navItems
        .filter(item => hasRole(item.roles))
        .map(item => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))
      }
    </nav>
  );
}
```

### 3. Protección de Rutas

```tsx
function ProtectedRoute({ children, allowedRoles }) {
  const { hasRole } = useAuth();
  
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Uso en el router
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

### 4. Formularios Condicionales

```tsx
function UserForm() {
  const { hasRole } = useAuth();
  const canEditRole = hasRole(['admin']);
  
  return (
    <form>
      <input name="name" placeholder="Nombre" />
      <input name="email" placeholder="Email" />
      
      {canEditRole && (
        <select name="role">
          <option value="user">Usuario</option>
          <option value="validator">Validador</option>
          <option value="admin">Administrador</option>
        </select>
      )}
      
      <button type="submit">
        {hasRole(['admin']) ? 'Crear Usuario' : 'Actualizar Perfil'}
      </button>
    </form>
  );
}
```

### 5. Tablas con Acciones Condicionales

```tsx
function UsersTable({ users }) {
  const { hasRole } = useAuth();
  
  const columns = [
    { header: "Nombre", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Rol", accessor: "role" },
    {
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {hasRole(['admin']) && (
            <>
              <Button size="sm" onClick={() => editUser(row.id)}>
                Editar
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => deleteUser(row.id)}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      )
    }
  ];
  
  return <DataTable columns={columns} data={users} />;
}
```

## Matriz de Permisos

| Acción | Usuario | Validador | Admin |
|--------|---------|-----------|-------|
| Completar formularios | ✅ | ✅ | ✅ |
| Ver reportes | ❌ | ✅ | ✅ |
| Validar formularios | ❌ | ✅ | ✅ |
| Crear formatos | ❌ | ✅ | ✅ |
| Editar formatos | ❌ | ❌ | ✅ |
| Crear usuarios | ❌ | ❌ | ✅ |
| Editar usuarios | ❌ | ❌ | ✅ |
| Eliminar usuarios | ❌ | ❌ | ✅ |
| Configuración del sistema | ❌ | ❌ | ✅ |

## Mejores Prácticas

1. **Siempre verifica permisos en el frontend Y backend**
2. **Usa el componente `RoleBasedAccess` para secciones grandes**
3. **Usa `hasRole` directamente para lógica simple**
4. **Proporciona feedback claro cuando se deniega el acceso**
5. **Mantén la matriz de permisos actualizada**
6. **Usa el hook `usePermissions` para verificaciones comunes**

## Página de Demostración

Puedes ver todos estos ejemplos en funcionamiento visitando `/demo/roles` en la aplicación.

## Troubleshooting

### El usuario no tiene el rol esperado
- Verifica que el usuario esté autenticado
- Revisa que el rol esté correctamente asignado en la base de datos
- Confirma que el token JWT contenga la información correcta

### Los permisos no se actualizan
- El usuario necesita cerrar sesión y volver a iniciar sesión
- Verifica que `fetchUser` se esté llamando correctamente
- Revisa que el estado del usuario se esté actualizando

### Componentes no se renderizan
- Asegúrate de que `hasRole` reciba un array de strings
- Verifica que los nombres de roles coincidan exactamente
- Revisa la consola del navegador para errores