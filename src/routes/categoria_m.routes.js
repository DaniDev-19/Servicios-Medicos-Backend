const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllCategoriaM, getCategoriaM, createCategoriaM, updateCategoriaM, deleteCategoriaM} = require('../controllers/categoria_m.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('categoria_m', 'ver'), getAllCategoriaM);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('categoria_m', 'crear'), createCategoriaM);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('categoria_m', 'ver'), getCategoriaM);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('categoria_m', 'editar'), updateCategoriaM);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('categoria_m', 'eliminar'), deleteCategoriaM);

module.exports = router;