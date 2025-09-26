const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllBitacora } = require('../controllers/bitacora.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('bitacora', 'ver'), getAllBitacora);

module.exports = router;