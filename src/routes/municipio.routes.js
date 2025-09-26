const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require ('../helpers/checkPermisos');
const { getAllMunicipio, getEstados, createMunicipio, updateMunicipio, getMunicipio, deleteMunicipio } = require('../controllers/municipio.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('municipio', 'ver'), getAllMunicipio);

router
    .route('/All_estados')
    .get(verificarToken, checkPermisos('municipio', ' ver'), getEstados);

router
    .route('/Registrar')
    .post(verificarToken, checkPermisos('municipio', 'crear'), createMunicipio);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('municipio', 'ver'), getMunicipio);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('municipio', 'editar'), updateMunicipio);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('municipio', 'eliminar'), deleteMunicipio);

module.exports = router;