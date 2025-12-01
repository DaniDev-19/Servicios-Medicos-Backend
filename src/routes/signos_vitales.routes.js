const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllSignos, createSignos, getSignos, updateSignos, deleteSignos, getSignosByPacienteId } = require('../controllers/signos_vitales.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('consulta', 'ver'), getAllSignos);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('consulta', 'crear'), createSignos);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('consulta', 'ver'), getSignos);

router
    .route('/paciente/:id')
    .get(verificarToken, checkPermisos('consulta', 'ver'), getSignosByPacienteId);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('consulta', 'editar'), updateSignos);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('consulta', 'eliminar'), deleteSignos);

module.exports = router;