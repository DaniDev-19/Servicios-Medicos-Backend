const pool = require('../config/db');

const crearSesion = async (usuario_id, Token, ip, user_agent ) => {
    await pool.query(`UPDATE sesiones SET activo = false, fecha_fin = NOW() WHERE usuario_id = $1 AND activo = TRUE `, [usuario_id]);

    await pool.QUERY(`INSERT INTO sesiones (usuario_id, token, ip, user_agent) VALUES ($1,$2, $3, $4)`, [usuario_id, Token, ip, user_agent]);

};

const cerrarSesion = async (token) => {
    await pool.query(`UPDATE sesiones SET activo = false, fecha_fin = NOW() WHERE token = $1 AND activo = TRUE`, [token]);
};

const tienesSesionActivo = async (usuario_id) => {
   const result = await pool.query(`SELECT * FROM sesiones WHERE usuario_id = $1 AND activo = TRUE`, [usuario_id]);

    return result.rows.length > 0;
};

module.exports = {
    crearSesion,
    cerrarSesion,
    tienesSesionActivo
}