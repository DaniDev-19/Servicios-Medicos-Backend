# Backend - Sistema de Gestión Integral de Servicios Médicos (Yutong)

Este es el servidor del Sistema de Gestión Integral de Servicios Médicos del Proyecto Yutong, construido con Node.js, Express y PostgreSQL.

## 🚀 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework para la creación de APIs REST.
- **PostgreSQL**: Base de datos relacional.
- **Socket.io**: Comunicación en tiempo real (Nota: Algunos módulos están en proceso de migración o removidos en `index.js`).
- **Nodemailer**: Envío de correos electrónicos.
- **Multer**: Gestión de carga de archivos (imagenes de pacientes, firmas, etc.).
- **Bcrypt**: Encriptación de contraseñas.
- **JWT**: Autenticación basada en JSON Web Tokens.

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/DaniDev-19/Servicios-Medicos.git
   cd Backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz del directorio `Backend` con el siguiente contenido (puedes basarte en el ejemplo):
   ```env
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=db_yutong
   JWT_SECRET=tu_clave_secreta
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_app_password
   PORT=4000
   ```

4. **Base de Datos**:
   Asegúrate de tener PostgreSQL instalado y crea la base de datos coincidente con `DB_NAME`.

## 🏃 Ejecución

- **Desarrollo (con Nodemon)**:
  ```bash
  npm run dev
  ```

- **Producción**:
  ```bash
  npm start
  ```

## 📂 Estructura del Proyecto

- `src/index.js`: Punto de entrada de la aplicación y configuración de Middlewares.
- `src/routes/`: Definición de los endpoints de la API.
- `src/controllers/`: Lógica de negocio de la aplicación.
- `src/config/`: Configuraciones de base de datos y otros servicios.
- `src/helpers/`: Funciones de ayuda reutilizables.
- `uploads/`: Carpeta para el almacenamiento local de archivos subidos.

---
Para más detalles técnicos, consulta la [Wiki de Backend](./wiki.md).
