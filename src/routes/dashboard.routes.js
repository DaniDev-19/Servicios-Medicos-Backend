const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getDashboardStats, getPaginatedActivity } = require('../controllers/dashboard.controller');

const router = Router();

router
    .route('/stats')
    .get(verificarToken, checkPermisos('home', 'ver'), getDashboardStats);

router
    .route('/actividad')
    .get(verificarToken, checkPermisos('home', 'actividad'), getPaginatedActivity);

module.exports = router;
