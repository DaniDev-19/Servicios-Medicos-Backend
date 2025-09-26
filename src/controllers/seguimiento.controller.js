const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllSeguimientos = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM seguimientos ORDER BY id DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo todos los seguimientos', error);
        next();
    }
};

const getSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM seguimientos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'El seguimiento no existe o no se encuentra' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error obteniendo seguimiento con id: ${id}`, error);
        next();
    }
};

const createSeguimiento = async (req, res, next) => {
    try {
        const {
            observaciones,
            recomendaciones,
            estado_clinico,
            usuario_id,
            consulta_id
        } = req.body;

        const result = await pool.query(
            `INSERT INTO seguimientos (
                observaciones, recomendaciones, estado_clinico,
                usuario_id, consulta_id
            ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fecha_seguimiento, observaciones, recomendaciones, estado_clinico, usuario_id, consulta_id]
        );

        await registrarBitacora({
            accion: 'Registrar',
            tabla: 'Seguimientos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró seguimiento clínico para consulta ID: ${consulta_id}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando seguimiento clínico', error);
        next();
    }
};

const updateSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const {
            observaciones,
            recomendaciones,
            estado_clinico,
            usuario_id,
            consulta_id
        } = req.body;

        const oldData = await pool.query('SELECT * FROM seguimientos WHERE id = $1', [id]);

        const result = await pool.query(
            `UPDATE seguimientos SET
                observaciones = $1,
                recomendaciones = $2,
                estado_clinico = $3,
                usuario_id = $4,
                consulta_id = $5
            WHERE id = $6 RETURNING *`,
            [observaciones, recomendaciones, estado_clinico, usuario_id, consulta_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado o no se pudo actualizar' });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Seguimientos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó seguimiento clínico con ID: ${id}`,
            datos: { antiguos: oldData.rows[0], nuevos: result.rows[0] }
        });

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error actualizando seguimiento con id: ${id}`, error);
        next();
    }
};

const deleteSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const oldData = await pool.query('SELECT * FROM seguimientos WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM seguimientos WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado o ya eliminado' });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Seguimientos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el seguimiento clínico con ID: ${id}`,
            datos: { antiguos: oldData.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error eliminando seguimiento con id: ${id}`, error);
        next();
    }
};

module.exports = {
    getAllSeguimientos,
    getSeguimiento,
    createSeguimiento,
    updateSeguimiento,
    deleteSeguimiento
};
