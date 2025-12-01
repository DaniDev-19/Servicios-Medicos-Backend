const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllHistoriasM, createHistoriaM, getHistoriasM, updateHistoriaM, deleteHistoriaM, getPacientes, getEnfermedades, getHistoriaByPacienteId } = require('../controllers/historias_medicas.controller');


const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('historias', 'ver'), getAllHistoriasM);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('historias', 'crear'), createHistoriaM);

router.get('/enfermedades', verificarToken, checkPermisos('historias', 'ver'), getEnfermedades);
router.get('/pacientes-lista', verificarToken, checkPermisos('historias', 'ver'), getPacientes);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('historias', 'ver'), getHistoriasM);

router
    .route('/paciente/:id') // Nueva ruta
    .get(verificarToken, checkPermisos('historias', 'ver'), getHistoriaByPacienteId);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('historias', 'editar'), updateHistoriaM);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('historias', 'eliminar'), deleteHistoriaM);


module.exports = router;