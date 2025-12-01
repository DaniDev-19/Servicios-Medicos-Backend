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

const getBitacoraById = async (req, res, next) => {
    const { id } = req.params;
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
            WHERE bitacora.id = $1
            LIMIT 1
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Registro de bitácora no encontrado' });
        }
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener bitácora por id', error.message);
        res.status(500).json({ message: 'Error al obtener bitácora por id' });
    }
};

module.exports = {getAllBitacora, getBitacoraById};