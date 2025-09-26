const pool = require('../config/db');

const getAllBitacora = async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT
            bitacora.id,
            TO_CHAR(bitacora.fecha, 'DD/MM/YY HH24:MI') AS fecha,
            bitacora.accion,
            bitacora.tabla,
            bitacora.usuario,
            bitacora.descripcion,
            bitacora.datos 
            FROM bitacora
            ORDER BY bitacora.id DESC
            `
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener bitácora', error.message);
        res.status(500).json({message: 'Error al obtener bitácora'});
    }
};

module.exports = {getAllBitacora};