const { Router } = require('express');
const  verificarToken  = require('../helpers/verificarToken');
const  checkPermisos  = require('../helpers/checkPermisos');
const { getAllCargo, getCargo, createCargo, updateCargo, deleteCargo } = require('../controllers/cargo.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('cargos', 'ver'), getAllCargo);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('cargos', 'crear'), createCargo);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('cargos', 'ver'), getCargo);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('cargos', 'editar'), updateCargo);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('cargos', 'eliminar'), deleteCargo);

module.exports = router;