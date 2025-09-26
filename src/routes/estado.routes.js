const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllEstado, getEstado, createEstado, updateEstado, deleteEstado } = require('../controllers/estado.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('estado', 'ver'), getAllEstado);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('estado', 'crear'), createEstado);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('estado', 'ver'), getEstado);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('estado', 'editar'), updateEstado);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('estado', 'eliminar'), deleteEstado);
    
module.exports = router;