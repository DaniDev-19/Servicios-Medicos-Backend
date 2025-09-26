const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require ('../helpers/checkPermisos');
const { getAllSector, getSector, createSector, updateSector, deleteSector, getParroquias, getMunicipios, getEstados } = require('../controllers/sector.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('sector', 'ver'), getAllSector);

router
    .route('/All_estados')
    .get(verificarToken, checkPermisos('sector', ' ver'), getEstados);

router
    .route('/All_municipios')
    .get(verificarToken, checkPermisos('sector', 'ver'), getMunicipios);

router
    .route('/All_parroquias')
    .get(verificarToken, checkPermisos('sector', 'ver'), getParroquias);

router
    .route('/Registrar')
    .post(verificarToken, checkPermisos('sector', 'crear'), createSector);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('sector', 'ver'), getSector);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('sector', 'editar'), updateSector);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('sector', 'eliminar'), deleteSector);

module.exports = router;