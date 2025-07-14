# Patio - Mood Tracking App

Una aplicación para que los equipos rastreen su estado de ánimo y bienestar.

## Características

- **Seguimiento de Estado de Ánimo**: Los usuarios pueden calificar su estado de ánimo del 1 al 5 en días específicos de la semana
- **Equipos**: Los usuarios pueden pertenecer a múltiples equipos
- **Comentarios WYSIWYG**: Comentarios ricos con menciones a otros usuarios
- **Entradas Anónimas**: Opción para hacer entradas anónimas
- **Configuración de Contacto**: Los usuarios pueden elegir si quieren que les contacten después de una entrada
- **Invitaciones por Email**: Invita usuarios por email con enlaces seguros
- **Notificaciones**: Sistema de notificaciones con pausas temporales
- **Menciones**: Menciona a otros miembros del equipo y recibe notificaciones

## Configuración de Base de Datos

### Prerequisitos

- PostgreSQL instalado y funcionando
- Node.js 18+ y pnpm

### Configuración

1. **Clona el repositorio e instala dependencias**:

```bash
git clone <repo-url>
cd patio
pnpm install
```

2. **Configura las variables de entorno**:

```bash
cp .env.example .env
```

Edita `.env` con tus valores reales:

- `DATABASE_URL`: Tu cadena de conexión de PostgreSQL
- `SMTP_*`: Configuración de tu servidor de email
- `BETTER_AUTH_*`: Configuración de autenticación
- `NEXT_PUBLIC_APP_URL`: URL de tu aplicación

3. **Configura la base de datos**:

```bash
# Genera las migraciones
pnpm db:generate

# Aplica las migraciones
pnpm db:migrate

# O usa push para desarrollo (sincroniza el schema directamente)
pnpm db:push
```

4. **Inicia la aplicación**:

```bash
pnpm dev
```

### Scripts de Base de Datos

- `pnpm db:generate` - Genera archivos de migración basados en cambios del schema
- `pnpm db:migrate` - Aplica migraciones pendientes a la base de datos
- `pnpm db:push` - Sincroniza el schema directamente (ideal para desarrollo)
- `pnpm db:studio` - Abre Drizzle Studio para explorar la base de datos

## Schema de Base de Datos

### Tablas Principales

- **users**: Información de usuarios, configuraciones de notificaciones
- **teams**: Equipos con códigos de invitación únicos
- **team_members**: Relación usuarios-equipos con roles (member/admin)
- **mood_entries**: Entradas de estado de ánimo con calificaciones y comentarios
- **team_invitations**: Invitaciones por email con tokens de seguridad
- **notifications**: Sistema de notificaciones para menciones y eventos
- **mentions**: Menciones entre usuarios en comentarios
- **user_settings**: Configuraciones personalizadas (días permitidos, zona horaria, etc.)

### Características del Schema

- **Entradas Anónimas**: Las entradas pueden ser anónimas con flag `is_anonymous`
- **Configuración de Contacto**: Flag `allow_contact` para controlar si otros pueden contactar
- **Pausas de Notificaciones**: Los usuarios pueden pausar notificaciones con razón y fecha límite
- **Días Configurables**: Los usuarios pueden elegir qué días de la semana quieren recibir recordatorios
- **Roles de Equipo**: Admins pueden gestionar equipos, enviar invitaciones y cambiar roles
- **Tokens Seguros**: Invitaciones con tokens únicos y fechas de expiración

## APIs Disponibles

### Usuarios

- `GET /api/users` - Obtener perfil del usuario actual
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users` - Actualizar perfil
- `GET/PUT /api/users/settings` - Gestionar configuraciones
- `POST /api/users/settings/resume-notifications` - Reanudar notificaciones

### Equipos

- `GET /api/teams` - Obtener equipos del usuario
- `POST /api/teams` - Crear nuevo equipo
- `GET/PUT/DELETE /api/teams/[teamId]` - Gestionar equipo específico
- `POST /api/teams/[teamId]/leave` - Abandonar equipo
- `GET/PUT/DELETE /api/teams/[teamId]/members` - Gestionar miembros

### Invitaciones

- `POST /api/invitations` - Enviar invitación por email
- `GET/POST /api/invitations/accept` - Aceptar invitación

### Entradas de Estado de Ánimo

- `GET /api/mood-entries` - Obtener entradas del equipo
- `POST /api/mood-entries` - Crear nueva entrada

### Notificaciones

- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications` - Marcar como leídas
- `DELETE /api/notifications` - Eliminar notificaciones

## Desarrollo

El proyecto usa:

- **Next.js 15** con App Router
- **Drizzle ORM** para base de datos
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Better Auth** para autenticación
- **Nodemailer** para envío de emails

Para explorar la base de datos durante el desarrollo:

```bash
pnpm db:studio
```

Esto abrirá Drizzle Studio en tu navegador para inspeccionar y editar datos.
