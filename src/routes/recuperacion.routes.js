const { Router } = require('express');
const {
    solicitarCodigo,
    verificarCodigo,
    cambiarPassword
} = require('../controllers/recuperacion.controller');

const router = Router();

router.post('/solicitar-codigo', solicitarCodigo);
router.post('/verificar-codigo', verificarCodigo);
router.post('/cambiar-password', cambiarPassword);

module.exports = router;