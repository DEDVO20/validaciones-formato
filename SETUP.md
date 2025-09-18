# Guía de Configuración para Nuevo PC

## Requisitos Previos

### Software Necesario
- **Node.js** (versión 18 o superior)
- **npm** (incluido con Node.js)
- **PostgreSQL** (versión 12 o superior)
- **Git**
- **Editor de código** (recomendado: VS Code)

## Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd "proyecto mvp"
```

### 2. Configuración del Backend

#### Instalar Dependencias
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_mvp
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura

# Puerto del servidor
PORT=3000
```

#### Configurar Base de Datos
1. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE proyecto_mvp;
```

2. Configurar variables de entorno (asegúrate de haber completado el paso anterior)

3. Ejecutar migración:
```bash
npx sequelize-cli db:migrate
```

Esto ejecutará la migración consolidada `20250115000000-create-all-tables.js` que creará todas las tablas necesarias:
- `users` - Usuarios del sistema con roles (user, validator, admin)
- `formats` - Formatos disponibles con variables JSON
- `completions` - Diligenciamientos realizados por usuarios
- `validaciones` - Validaciones de diligenciamientos por validadores
- `notifications` - Sistema de notificaciones
- `FormatSubmissions` - Envíos de formatos (tabla adicional)

**Nota:** Ahora solo hay **una migración** en lugar de múltiples archivos separados.

3. (Opcional) Ejecutar seeders para datos de prueba:
```bash
npx sequelize-cli db:seed:all
```

### 3. Configuración del Frontend

#### Instalar Dependencias
```bash
cd ../frontend
npm install
```

#### Configurar Variables de Entorno
1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar el archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## Ejecutar la Aplicación

### Modo Desarrollo

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Acceder a la Aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## Estructura del Proyecto

```
proyecto mvp/
├── backend/                 # Servidor Node.js + Express
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── models/         # Modelos de Sequelize
│   │   ├── routes/         # Definición de rutas
│   │   ├── middlewares/    # Middlewares personalizados
│   │   └── utils/          # Utilidades
│   ├── migrations/         # Migraciones de base de datos
│   └── package.json
└── frontend/               # Aplicación React + TypeScript
    ├── src/
    │   ├── components/     # Componentes reutilizables
    │   ├── pages/          # Páginas de la aplicación
    │   ├── services/       # Servicios API
    │   └── hooks/          # Hooks personalizados
    └── package.json
```

## Funcionalidades Principales

### Sistema de Roles
- **Admin**: Acceso completo al sistema
- **User**: Puede completar formularios y usar formatos
- **Validator**: Puede validar formularios (sin crear formatos)

### Características de Seguridad
- Autenticación JWT
- Validaciones de contraseña:
  - Campos obligatorios
  - Longitud mínima de 6 caracteres
  - Verificación de contraseña actual
  - Nueva contraseña debe ser diferente

## Comandos Útiles

### Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir migración
npx sequelize-cli db:migrate:undo
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Solución de Problemas Comunes

### Error de Conexión a Base de Datos
1. Verificar que PostgreSQL esté ejecutándose
2. Comprobar credenciales en `.env`
3. Asegurar que la base de datos existe

### Error de Puerto en Uso
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :3000

# Terminar proceso (Windows)
taskkill /PID <PID> /F
```

### Problemas de CORS
- Verificar que `VITE_API_URL` apunte al backend correcto
- Comprobar configuración de CORS en el backend

## Contacto y Soporte

Para problemas o preguntas adicionales, contactar al equipo de desarrollo.

---

**Nota**: Este archivo debe actualizarse cuando se agreguen nuevas funcionalidades o cambien los requisitos del sistema.