const { Router } = require('express');
const { enviarValoracion } = require('../controllers/valoracion.controller');
const verificarToken = require('../helpers/verificarToken');

const router = Router();

router.post('/enviar', verificarToken, enviarValoracion);

module.exports = router;
