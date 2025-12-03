const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const { getNotificaciones, marcarLeida, marcarTodasLeidas } = require('../controllers/notificaciones.controller');

const router = Router();

router.get('/', verificarToken, getNotificaciones);
router.put('/marcar-leida/:id', verificarToken, marcarLeida);
router.put('/marcar-todas-leidas', verificarToken, marcarTodasLeidas);

module.exports = router;
