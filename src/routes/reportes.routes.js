const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const verificarToken = require('../helpers/verificarToken');

router.get('/epidemiologico', verificarToken, reportesController.getEpidemiologicoData);
router.get('/ausentismo', verificarToken, reportesController.getAusentismoData);
router.get('/productividad', verificarToken, reportesController.getProductividadData);

module.exports = router;
