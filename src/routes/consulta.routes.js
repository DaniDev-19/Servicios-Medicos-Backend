const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllConsultas, createConsultas, getConsultas, updateConsulta, deleteConsulta, getMedicamentos, getEnfermedades } = require('../controllers/consultas.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('consulta', 'ver'), getAllConsultas);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('consulta', 'crear'), createConsultas)
    .get(verificarToken, checkPermisos('consulta', 'ver'), getMedicamentos)
    .get(verificarToken, checkPermisos('consulta', ' ver'), getEnfermedades);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('consulta', 'ver'), getConsultas);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('consulta', 'editar'), updateConsulta);

router
    .route('/delete/:id')
    .delete(verificarToken, checkPermisos('consulta', 'eliminar'), deleteConsulta);


module.exports = router;