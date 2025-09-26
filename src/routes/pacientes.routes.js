const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllPacientes, createPaciente, getPacientes, updatePaciente, deletePacientes, getMunicipios, getDepartamentos, getCargos, getProfesiones, getEstados, getParroquias, getSectores } = require('../controllers/pacientes.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getAllPacientes);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('pacientes', 'crear'), createPaciente);

router
    .route('/all_estados')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getEstados);

router
    .route('/all_municipios')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getMunicipios);

router
    .route('/all_parroquias')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getParroquias);

router
    .route('/all_sectores')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getSectores);

router
    .route('/all_deparatamentos')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getDepartamentos);

router
    .route('/all_cargos')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getCargos);

router
    .route('all_profesion')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getProfesiones);

router
    .route('/:id')
    .get(verificarToken, checkPermisos('pacientes', 'ver'), getPacientes);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('pacientes', 'editar'), updatePaciente);

router
    .route('/delete/:id')
    .delete(verificarToken, checkPermisos('pacientes', 'eliminar'), deletePacientes);

module.exports = router;