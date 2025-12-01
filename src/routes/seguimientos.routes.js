const { Router } = require('express');
const {
    getAllSeguimientos,
    getSeguimientosByPaciente,
    getSeguimiento,
    createSeguimiento,
    updateSeguimiento,
    deleteSeguimiento
} = require('../controllers/seguimientos.controller');
const router = Router();

// Rutas de seguimientos
router.get('/', getAllSeguimientos);
router.post('/registrar', createSeguimiento);
router.get('/paciente/:id', getSeguimientosByPaciente);
router.get('/:id', getSeguimiento);
router.put('/:id', updateSeguimiento);
router.delete('/:id', deleteSeguimiento);

module.exports = router;
