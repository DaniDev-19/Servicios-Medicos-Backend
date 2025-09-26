const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllSeguimientos, createSeguimiento, getSeguimiento, updateSeguimiento, deleteSeguimiento } = require('../controllers/seguimiento.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('seguimiento', 'ver'), getAllSeguimientos);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('seguimiento', 'crear'), createSeguimiento);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('seguimiento', 'ver'), getSeguimiento);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('seguimiento', 'editar'), updateSeguimiento);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('seguimiento', 'eliminar'), deleteSeguimiento);
    
module.exports = router;