const {Router} = require('express');
const verificarToken = require('../helpers/verificarToken');
const chekPermisos = require('../helpers/checkPermisos');
const { getAllReposos, actualizarEstadosReposos, createReposo, getReposo, updateReposo, deleteReposo } = require('../controllers/reposos.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, chekPermisos('reposos', 'ver'),getAllReposos)
    .get(verificarToken, chekPermisos('reposos', 'ver'), actualizarEstadosReposos);

router
    .route('/registrar')
    .post(verificarToken, chekPermisos('reposos', 'crear'), createReposo);

router
    .route('/ver/:id')
    .get(verificarToken, chekPermisos('reposos', 'ver'), getReposo);

router
    .route('/actualizar/:id')
    .put(verificarToken, chekPermisos('reposos', 'editar'), updateReposo);

router
    .route('/eliminar/:id')
    .delete(verificarToken, chekPermisos('reposos', 'eliminar'), deleteReposo);
    
module.exports = router;
