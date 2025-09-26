const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllMunicipio = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT 
                m.id AS municipio_id, 
                m.codigo AS municipio_codigo,
                m.nombre AS municipio_nombre,
                est.id AS estado_id, 
                est.codigo AS estado_codigo
                est.nombre AS estado_nombre,
            FROM municipio m
            INNER JOIN estado est ON m.estado_id = est.id
            ORDER BY m.id DESC`
        );

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los municipios', error);
        next(error);
    }
};

const getMunicipio = async (req, res, next) => {
    const { id } = req.params;

    try {   
        const result = await pool.query(`SELECT * FROM municipio WHERE id = $1`, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error en la Solicitud --> no puede ser encontrada o es inexistente'
            });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener el municipio con id ${id}`, error);
        next(error);
    }
};

const getEstados = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM estado ORDER BY id ASC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los estados', error);
        next(error);
    }
};

const createMunicipio = async (req, res, next) => {
    const { nombre, estado_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO municipio (nombre, estado_id) VALUES ($1, $2) RETURNING *',
            [nombre, estado_id]
        );

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Municipios',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró el municipio con nombre: ${nombre}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar el municipio', error);
        next(error);
    }
};

const updateMunicipio = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, estado_id } = req.body;

    try {
        const oldMunicipio = await pool.query('SELECT * FROM municipio WHERE id = $1', [id]);

        const result = await pool.query(
            'UPDATE municipio SET nombre = $1, estado_id = $2 WHERE id = $3 RETURNING *',
            [nombre, estado_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error en la Solicitud --> no puede ser encontrada o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Municipios',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el municipio con id: ${id}`,
            datos: { antiguos: oldMunicipio.rows[0], nuevos: result.rows[0] }
        });

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar el municipio con id: ${id}`, error);
        next(error);
    }
};

const deleteMunicipio = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldMunicipio = await pool.query('SELECT * FROM municipio WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM municipio WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Error en la Solicitud ---> no puede ser encontrada o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Municipios',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el municipio ${oldMunicipio.rows[0]?.nombre || id}`,
            datos: { antiguos: oldMunicipio.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error al eliminar el municipio con id: ${id}`, error);
        next(error);
    }
};

module.exports = {
    getAllMunicipio,
    getMunicipio,
    getEstados,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio
};
