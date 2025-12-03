const { Router } = require('express');
const { getAllAtenciones, createAtencion, updateAtencion, deleteAtencion } = require('../controllers/atenciones.controller');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');

const router = Router();

router.get('/', verificarToken, checkPermisos('atenciones', 'ver'), getAllAtenciones);
router.post('/registrar', verificarToken, checkPermisos('atenciones', 'crear'), createAtencion);
router.put('/actualizar/:id', verificarToken, checkPermisos('atenciones', 'editar'), updateAtencion);
router.delete('/eliminar/:id', verificarToken, checkPermisos('atenciones', 'eliminar'), deleteAtencion);

module.exports = router;
