const express = require('express');
const morgan = require('morgan');
// const path = require('path');
const cors = require('cors');
require('./cleanSesion');

/////// INICIO RUTASS///////
const cargos = require('./routes/cargo.routes');
const profesion = require('./routes/profesion.routes');
const estado = require('./routes/estado.routes');
const categoria_e = require('./routes/categoria_e.routes');
const categoria_m = require('./routes/categoria_m.routes');
const finalidades = require('./routes/finalidades.routes');
const roles = require('./routes/roles.routes');
const departamentos = require('./routes/departamentos.routes');
const municipios = require('./routes/municipio.routes');
const parroquias = require('./routes/parroquias.routes');
const sectores = require('./routes/sector.routes');
const pacientes = require('./routes/pacientes.routes');
const doctores = require('./routes/doctor.routes');
const bitacora = require('./routes/bitacora.routes');
const enfermedades = require('./routes/enfermedades.routes');
const usuario = require('./routes/usuario.routes');
const medicamentos = require('./routes/medicamentos.routes');
const historiasMedicas = require('./routes/historias_medicas.routes');
const signos = require('./routes/signos_vitales.routes');
const reposos = require('./routes/reposos.routes');
const seguimientos = require('./routes/seguimientos.routes');
const consultas = require('./routes/consulta.routes');
const login = require('./routes/auth.routes');
const recuperacion = require('./routes/recuperacion.routes');
const atenciones = require('./routes/atenciones.routes');
const citas = require('./routes/citas.routes');
const dashboard = require('./routes/dashboard.routes');
const notificaciones = require('./routes/notificaciones.routes');

// ///////// FIN RUTAS ///////


// --- Configuración de CORS ---
const allowed = [
    'http://localhost:5173', 'http://localhost:4000', 'https://servicios-medicos-puce.vercel.app', 'https://servicios-medicos-xi.vercel.app/', 'https://servicios-medicos-xi.vercel.app'
];
const corsOptions = {
    origin: allowed,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
};
// INICIANDO EXPRESS////

const app = express();
app.use(express.json());

///// MIDDLEWARES////////

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Logger manual para depuración extrema
app.use((req, res, next) => {
    console.log(`[DEBUG] Petición entrante: ${req.method} ${req.url}`);
    next();
});

////////////////////////// 

// -----Socket.io REMOVED ------
// const server = http.createServer(app);
// const io = new Server(server, { ... });
// global.io = io;
// app.set('io', io);
// io.on('connection', ...);
// -------------------////////////////////

///////////// USO DE RUTAS ////////////////
app.use('/recuperacion', recuperacion);
app.use('/auth', login);
app.use('/consultas', consultas);
app.use('/seguimientos', seguimientos);
app.use('/reposos', reposos);
app.use('/signos_vitales', signos);
app.use('/historias_medicas', historiasMedicas);
app.use('/medicamentos', medicamentos);
app.use('/usuarios', usuario);
app.use('/enfermedades', enfermedades);
app.use('/bitacora', bitacora);
app.use('/doctores', doctores);
app.use('/pacientes', pacientes);
app.use('/sectores', sectores);
app.use('/parroquias', parroquias);
app.use('/municipios', municipios);
app.use('/departamentos', departamentos);
app.use('/roles', roles);
app.use('/finalidades', finalidades);
app.use('/categoria_e', categoria_e);
app.use('/categoria_m', categoria_m);
app.use('/estado', estado);
app.use('/cargos', cargos);
app.use('/profesion', profesion);
app.use('/atenciones', atenciones);
app.use('/citas', citas);
app.use('/dashboard', dashboard);
app.use('/notificaciones', notificaciones);
// FIN DEL USO DE RUTAS ///////////////////

// ----Manejador de Errores Globales/////////
app.use((req, res, next) => {
    res.status(404).json({
        message: 'ruta no encontrada',
    });
});

app.use((err, req, res, next) => {
    console.error('Error Capturado:', err.stack);
    res.status(err.status || 500).json({
        message: 'Ocurrió un error interno en el servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno',
    });
});
/////////////////////////--------------------------//////////////////////////

/////////// LISTAR EN PUERTO DEL SERVIDOR PARA SU INICIO ////////////////

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`);
});

