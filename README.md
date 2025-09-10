# Sistema de Gestión de Diligenciamientos

Sistema web para la gestión de diligenciamientos con validaciones y generación de PDFs.

## Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **MySQL** (versión 8.0 o superior)
- **Git**

## Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd proyecto-mvp
```

### 2. Configurar el Backend

#### 2.1 Instalar dependencias

```bash
cd backend
npm install
```

#### 2.2 Configurar la base de datos

1. Crear una base de datos MySQL:

```sql
CREATE DATABASE diligenciamientos_db;
```

2. Crear un archivo `.env` en la carpeta `backend` con la siguiente configuración:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=diligenciamientos_db
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql

# JWT Secret (genera una clave secreta segura)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Puerto del servidor
PORT=3000
```

#### 2.3 Ejecutar migraciones

```bash
npx sequelize-cli db:migrate
```

#### 2.4 Crear datos de prueba (opcional)

```bash
npx ts-node src/seedData.ts
```

Esto creará usuarios de prueba:
- **Admin**: admin@example.com (contraseña: 123456)
- **Validador**: validator@example.com (contraseña: 123456)
- **Usuario**: user@example.com (contraseña: 123456)

### 3. Configurar el Frontend

#### 3.1 Instalar dependencias

```bash
cd ../frontend
npm install
```

#### 3.2 Configurar variables de entorno

Crear un archivo `.env` en la carpeta `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

## Ejecución

### Modo Desarrollo

1. **Iniciar el backend** (en una terminal):

```bash
cd backend
npm run dev
```

El servidor estará disponible en: http://localhost:3000

2. **Iniciar el frontend** (en otra terminal):

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: http://localhost:5174

### Modo Producción

1. **Compilar el frontend**:

```bash
cd frontend
npm run build
```

2. **Compilar el backend**:

```bash
cd backend
npm run build
```

3. **Ejecutar en producción**:

```bash
cd backend
npm start
```

## Estructura del Proyecto

```
proyecto-mvp/
├── backend/                 # API REST con Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Controladores de la API
│   │   ├── models/         # Modelos de Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Middlewares de autenticación
│   │   ├── utils/          # Utilidades (JWT, PDF, etc.)
│   │   └── config/         # Configuración de BD
│   ├── migrations/         # Migraciones de base de datos
│   └── package.json
├── frontend/               # Aplicación React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Hooks personalizados
│   │   └── services/       # Servicios de API
│   └── package.json
└── README.md
```

## Funcionalidades

### Roles de Usuario

- **Admin**: Gestión completa del sistema
- **Validador**: Validación de diligenciamientos
- **Usuario**: Creación y seguimiento de diligenciamientos

### Características Principales

- ✅ Autenticación JWT
- ✅ Gestión de formatos dinámicos
- ✅ Creación de diligenciamientos
- ✅ Sistema de validaciones
- ✅ Generación de PDFs
- ✅ Dashboard con métricas
- ✅ Interfaz responsive

## Solución de Problemas

### Error de conexión a la base de datos

1. Verificar que MySQL esté ejecutándose
2. Confirmar las credenciales en el archivo `.env`
3. Asegurarse de que la base de datos existe

### Error "Token inválido"

1. Verificar que `JWT_SECRET` esté configurado en `.env`
2. Limpiar localStorage del navegador
3. Reiniciar el servidor backend

### Puertos ocupados

Si los puertos 3000 o 5174 están ocupados:

- **Backend**: Cambiar `PORT` en `.env`
- **Frontend**: Usar `npm run dev -- --port 3001`

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crear un issue en el repositorio de GitHub.