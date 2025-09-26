const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require ('../helpers/checkPermisos');
const { getAllParroquia, getEstados, createParroquia, getParroquia, updateParroquia, deleteParroquia, getMunicipios } = require('../controllers/parroquia.controller');


const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('parroquia', 'ver'), getAllParroquia);

router
    .route('/All_estados')
    .get(verificarToken, checkPermisos('parroquia', ' ver'), getEstados);

router
    .route('/All_municipios')
    .get(verificarToken, checkPermisos('parroquia', ' ver'), getMunicipios);

router
    .route('/Registrar')
    .post(verificarToken, checkPermisos('parroquia', 'crear'), createParroquia);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('parroquia', 'ver'), getParroquia);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('parroquia', 'editar'), updateParroquia);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('parroquia', 'eliminar'), deleteParroquia);

module.exports = router;