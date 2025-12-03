const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const checkPermisos = require('../helpers/checkPermisos');
const { getDashboardStats } = require('../controllers/dashboard.controller');

const router = Router();

router
    .route('/stats')
    .get(verificarToken, checkPermisos('home', 'ver'), getDashboardStats);

module.exports = router;
