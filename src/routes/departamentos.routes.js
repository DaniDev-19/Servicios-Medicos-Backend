const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { createDepartamentos, getAllDepartamentos, getFinalidades, getDepartamentos, updateDepartamentos, deleteDepartamentos } = require('../controllers/departamentos.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('departamentos', 'ver'), getAllDepartamentos);

router
    .route('/Registrar')
    .post(verificarToken, checkPermisos('departamentos', 'crear'), createDepartamentos);

router
    .route('/finalidades')
    .get(verificarToken, checkPermisos('departamentos', 'ver'), getFinalidades);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('departamentos', 'ver'), getDepartamentos);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('departamentos', 'editar'), updateDepartamentos);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('departamentos', 'eliminar'), deleteDepartamentos);

module.exports = router;