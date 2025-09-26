const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllUsuarios, createUsuario, getUsuario, updateUsuario, deleteUsuario, getCargos, getProfesiones, getRoles, getDoctores } = require('../controllers/usuarios.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('usuario', 'ver'), getAllUsuarios);

router
    .route('/registrar')
    .post(verificarToken, checkPermisos('usuario', 'crear'), createUsuario)
    .get(verificarToken, checkPermisos('usuario', 'ver'), getProfesiones)
    .get(verificarToken, checkPermisos('usuario', 'ver'), getRoles)
    .get(verificarToken, checkPermisos('usuario', 'ver'), getDoctores)
    .get(verificarToken, checkPermisos('usuario', 'ver'), getCargos);

router
    .route('/ver/:id')
    .get(verificarToken, checkPermisos('usuario', 'ver'), getUsuario);

router
    .route('/actualizar/:id')
    .put(verificarToken, checkPermisos('usuario', 'editar'), updateUsuario);

router
    .route('/eliminar/:id')
    .delete(verificarToken, checkPermisos('usuario', 'eliminar'), deleteUsuario);

module.exports = router;
