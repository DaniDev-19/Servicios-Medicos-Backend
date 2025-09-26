const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllSignos, createSignos, getSignos, updateSignos, deleteSignos } = require('../controllers/signos_vitales.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('signos', 'ver'), getAllSignos);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('signos', 'crear'), createSignos);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('signos', 'ver'), getSignos);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('signos', 'editar'), updateSignos);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('signos', 'eliminar'), deleteSignos);
    
module.exports = router;