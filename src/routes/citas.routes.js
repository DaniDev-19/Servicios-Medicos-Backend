const { Router } = require('express');
const { getAllCitas, createCita, updateCita, deleteCita, getCitasPendientesByPaciente, getCitaById } = require('../controllers/citas.controller');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');

const router = Router();

router.get('/', verificarToken, checkPermisos('citas', 'ver'), getAllCitas);
router.post('/registrar', verificarToken, checkPermisos('citas', 'crear'), createCita);
router.get('/pendientes/:pacienteId', verificarToken, checkPermisos('citas', 'ver'), getCitasPendientesByPaciente);
router.get('/ver/:id', verificarToken, checkPermisos('citas', 'ver'), getCitaById);
router.put('/actualizar/:id', verificarToken, checkPermisos('citas', 'editar'), updateCita);
router.delete('/eliminar/:id', verificarToken, checkPermisos('citas', 'eliminar'), deleteCita);

module.exports = router;
