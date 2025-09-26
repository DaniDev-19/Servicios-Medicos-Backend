const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllParroquia = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id AS parroquia_id,
                p.nombre AS parroquia_nombre,
                p.codigo AS parroquia_codigo,
                m.id AS municipio_id,
                m.nombre AS municipio_nombre,
                m.codigo AS municipio_codigo,
                e.id AS estado_id,
                e.nombre AS estado_nombre,
                e.codigo AS estado_codigo
            FROM parroquia p
            INNER JOIN municipio m ON p.municipio_id = m.id
            INNER JOIN estado e ON m.estado_id = e.id
            ORDER BY p.id DESC
        `);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las parroquias', error);
        next(error);
    }
};

const getParroquia = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM parroquia WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error: la parroquia no se encuentra o es inexistente'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener la parroquia con id ${id}`, error);
        next(error);
    }
};

const getEstados = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM estado ORDER BY id DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo los estados', error);
        next(error);
    }
};

const getMunicipios = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM municipio ORDER BY id DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo los municipios', error);
        next(error);
    }
};

const createParroquia = async (req, res, next) => {
    const { nombre, municipio_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO parroquia (nombre, municipio_id) VALUES ($1, $2) RETURNING *',
            [nombre, municipio_id]
        );

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Parroquia',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró la parroquia con nombre: ${nombre}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar la parroquia', error);
        next(error);
    }
};

const updateParroquia = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, municipio_id } = req.body;

    try {
        const oldParroquia = await pool.query('SELECT * FROM parroquia WHERE id = $1', [id]);

        const result = await pool.query(
            'UPDATE parroquia SET nombre = $1, municipio_id = $2 WHERE id = $3 RETURNING *',
            [nombre, municipio_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error: la parroquia no puede ser encontrada o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Parroquia',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó la parroquia con id: ${id}`,
            datos: { antiguos: oldParroquia.rows[0], nuevos: result.rows[0] }
        });

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar la parroquia con id ${id}`, error);
        next(error);
    }
};

const deleteParroquia = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldParroquia = await pool.query('SELECT * FROM parroquia WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM parroquia WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Error: la parroquia no se encuentra o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Parroquia',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó la parroquia: ${oldParroquia.rows[0]?.nombre || id}`,
            datos: { antiguos: oldParroquia.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error al eliminar la parroquia con id: ${id}`, error);
        next(error);
    }
};

module.exports = {
    getAllParroquia,
    getParroquia,
    getEstados,
    getMunicipios,
    createParroquia,
    updateParroquia,
    deleteParroquia
};
