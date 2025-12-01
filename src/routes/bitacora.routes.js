const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getAllBitacora, getBitacoraById } = require('../controllers/bitacora.controller');

const router = Router();

router
    .route('/')
    .get(verificarToken, checkPermisos('bitacora', 'ver'), getAllBitacora);

    router
    .route('/:id')
    .get(verificarToken, checkPermisos('bitacora', 'ver'), getBitacoraById);

module.exports = router;