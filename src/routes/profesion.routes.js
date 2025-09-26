const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllProfesion, getProfesion, createProfesion, updateProfesion, deleteProfesion } = require('../controllers/profesion.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('profesion', 'ver'), getAllProfesion);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('profesion', 'crear'), createProfesion);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('profesion', 'ver'), getProfesion);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('profesion', 'editar'), updateProfesion);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('profesion', 'eliminar'), deleteProfesion);
    
module.exports = router;