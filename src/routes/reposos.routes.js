const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const chekPermisos = require('../helpers/checkPermisos');
const {
    getAllReposos,
    actualizarEstadosReposos,
    createReposo,
    getReposo,
    updateReposo,
    deleteReposo,
    getRepososByPaciente
} = require('../controllers/reposos.controller');

console.log("--> [DEBUG] createReposo es tipo:", typeof createReposo);

const router = Router();

console.log("--> Cargando rutas de REPOSOS");

// Ruta de prueba
router.get('/ping', (req, res) => {
    console.log("Ping a reposos recibido");
    res.send('pong');
});

// Rutas generales
router.get('/', verificarToken, chekPermisos('reposos', 'ver'), getAllReposos);
router.get('/actualizar-estados', verificarToken, chekPermisos('reposos', 'ver'), actualizarEstadosReposos);

// Registrar
router.post('/registrar', verificarToken, chekPermisos('reposos', 'crear'), createReposo);

// Operaciones por ID
router.get('/ver/:id', verificarToken, chekPermisos('reposos', 'ver'), getReposo);
router.put('/actualizar/:id', verificarToken, chekPermisos('reposos', 'editar'), updateReposo);
router.delete('/eliminar/:id', verificarToken, chekPermisos('reposos', 'eliminar'), deleteReposo);

// Operaciones por Paciente
router.get('/paciente/:id', verificarToken, chekPermisos('reposos', 'ver'), getRepososByPaciente);

module.exports = router;
