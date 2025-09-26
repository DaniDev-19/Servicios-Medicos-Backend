const { Router } = require('express');
const verificarToken = require('../helpers/verificarToken');
const { loginUsuario, logoutUsuario, getNotificacionesPendientes } = require('../controllers/login.controller');

const router = Router();

router
    .route('/login')
    .post(loginUsuario);

router
    .route('/logout')
    .post(logoutUsuario);

router
    .route('/perfil')
    .get(verificarToken, (req, res) => {
        res.json({message: 'Acceso Permitido', user: req.user });
    });

router
    .route('/pendientes', verificarToken, getNotificacionesPendientes);

module.exports = router;