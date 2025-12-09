## **README - Backend**

```markdown
# Cuidarte Yutong - Backend

API RESTful para la gestión de servicios médicos, desarrollada con **Node.js** y **Express**. Provee endpoints seguros para la administración de usuarios, historias clínicas, medicamentos, notificaciones y más.

## 🚀 Características

- Autenticación JWT y control de acceso por roles
- Gestión de usuarios, doctores y pacientes
- Registro y consulta de historias médicas
- Inventario y auditoría de medicamentos
- Notificaciones internas y bitácora de acciones
- Integración con PostgreSQL
- Despliegue automatizado con Docker y PM2

## 🛠️ Tecnologías

- Node.js
- Express
- PostgreSQL
- JWT
- Docker
- PM2
- GitHub Actions (CI/CD)

## 📦 Instalación

```bash
git clone https://github.com/tuusuario/cuidarte-yutong-backend.git
cd cuidarte-yutong-backend
npm install
cp .env.example .env
# Configura tus variables de entorno
npm start

 Configuración
Edita el archivo .env con tus credenciales de base de datos y claves JWT.
Revisa los scripts SQL en /DataBase para inicializar la base de datos.
📄 Estructura
src/controllers/: Lógica de negocio y endpoints
src/routes/: Definición de rutas
src/helpers/: Funciones auxiliares (permisos, bitácora, token)
src/config/: Configuración de base de datos y entorno
📝 Contribuciones
Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias y mejoras.

📄 Licencia
MIT
