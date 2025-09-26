const {Router} = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllHistoriasM, createHistoriaM, getHistoriasM, updateHistoriaM, deleteHistoriaM, getPacientes, getEnfermedades } = require('../controllers/historias_medicas.controller');


const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('historias_medicas', 'ver'), getAllHistoriasM);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('historias_medicas', 'crear'), createHistoriaM)
    .post(verificarToken, checkPermisos('historias_medicas', 'ver'), getEnfermedades)
    .get(verificarToken, checkPermisos('historias_medicas', 'ver'), getPacientes);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('historias_medicas', 'ver'), getHistoriasM);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('historias_medicas', 'editar'), updateHistoriaM);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('historias_medicas', 'eliminar'), deleteHistoriaM);


module.exports = router;