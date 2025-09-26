const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verificarToken = async (req, res, next) => {
    try {
        const autenticarHeader = req.headers.authorization;
        if (!autenticarHeader || !autenticarHeader.startsWith('Bearer')) {
            return res.status(401).json({
                message: 'Token no proporcionado'
            });
        }

        const token = autenticarHeader.split('')[1];

        // VERIFICAR EL JWT///////

        let decoded;
        
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        } catch (err) {
            return res.status(401).json({
                message: 'Token invalido o Expirado'
            });
        }

        // VERIFICAR LA SESION SI ESTA ACTIVA EN DB////
        const sesion = await pool.query('SELECT * FROM sesiones WHERE token = $1 AND activo = true',
            [token]
        );

        if(sesion.rows.length === 0){
            return res.status(404).json({message: 'Sesión no activa o Token inválido'})
        }

        req.user = decoded;
        next();

    } catch (error) {
        res.status(500).json({ message:'Error Verificando Token', error: error.message });
    }
};

module.exports = verificarToken;