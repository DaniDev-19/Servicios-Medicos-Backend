const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllCategoriaE, getCategoriaE, createCategoriaE, updateCategoriaE, deleteCategoriaE} = require('../controllers/categoria_e.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('categoria_e', 'ver'), getAllCategoriaE);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('categoria_e', 'crear'), createCategoriaE);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('categoria_e', 'ver'), getCategoriaE);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('categoria_e', 'editar'), updateCategoriaE);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('categoria_e', 'eliminar'), deleteCategoriaE);

module.exports = router;