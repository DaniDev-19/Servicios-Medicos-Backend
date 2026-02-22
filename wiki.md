# Wiki - Backend Proyecto Yutong

## 🏛️ Arquitectura del Sistema

El backend sigue un patrón **Controlador-Ruta**, donde:
- **Routes**: Escuchan las peticiones HTTP y las derivan al controlador correspondiente.
- **Controllers**: Contienen la lógica para interactuar con el Pool de la base de datos y retornar respuestas.
- **Config**: Gestiona la conexión persistente a PostgreSQL mediante `pg.Pool`.

## 🛣️ Catálogo de Endpoints Principales

La API está organizada en los siguientes módulos:

### Autenticación y Seguridad
- `/auth`: Inicio de sesión y validación de tokens.
- `/recuperacion`: Gestión de recuperación de contraseñas vía email.
- `/usuario`: CRUD de usuarios y gestión de perfiles.

### Gestión Médica
- `/pacientes`: Registro y consulta de información de pacientes.
- `/historias_medicas`: Gestión de expedientes clínicos.
- `/consultas`: Registro de nuevas atenciones médicas.
- `/seguimientos`: Seguimiento del estado evolutivo del paciente.
- `/citas`: Agendamiento de servicios médicos.
- `/atenciones`: Registro de atenciones rápidas o de enfermería.

### Inventario y Farmacia
- `/medicamentos`: Catálogo de fármacos disponibles.
- `/categoria_m`: Clasificación de medicamentos.

### Configuración del Sistema
- `/departamentos`, `/cargos`, `/profesion`: Parámetros organizacionales.
- `/parroquias`, `/municipios`, `/sectores`: Localización geográfica.
- `/enfermedades`: Catálogo CIE-10 o similar.
- `/estado`: Estados de registros y citas.

### Reportes y Auditoría
- `/dashboard`: Datos agregados para estadísticas.
- `/reportes`: Generación de datos para documentos.
- `/bitacora`: Registro de acciones realizadas por los usuarios para auditoría.

## 🔐 Seguridad y Auth

1. **JWT**: Se requiere un token en el encabezado de las peticiones protegidas.
2. **CORS**: Configurado para permitir conexiones desde el dominio de Vercel y `localhost`.
3. **Bcrypt**: Las contraseñas nunca se almacenan en texto plano en la base de datos.

## 📧 Integraciones

- **Email**: Utiliza Gmail (vía App Passwords) para notificaciones y recuperación.
- **Carga de Archivos**: Implementado con `multer` en la carpeta `uploads`. Se recomienda asegurar esta carpeta en el servidor de despliegue.

## 🛠️ Mantenimiento

- **Limpieza de Sesiones**: El script `src/cleanSesion.js` se encarga de tareas de mantenimiento sobre sesiones o datos temporales (revisar configuración en `src/index.js`).
