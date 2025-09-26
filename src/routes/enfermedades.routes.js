const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require ('../helpers/checkPermisos');
const { getAllEnfermedades, getEnfermedades, getCategoria_e, createEnfermedad, updateEnfermedad, deleteEnfermedad } = require('../controllers/enfermedades.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('enfermedades', 'ver'), getAllEnfermedades);

router
    .route('/All_categorias_e')
    .get(verificarToken, checkPermisos('enfermedades', ' ver'), getCategoria_e);

router
    .route('/Registrar')
    .post(verificarToken, checkPermisos('enfermedades', 'crear'), createEnfermedad);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('enfermedades', 'ver'), getEnfermedades);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('enfermedades', 'editar'), updateEnfermedad);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('enfermedades', 'eliminar'), deleteEnfermedad);

module.exports = router;