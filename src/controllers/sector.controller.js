const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllSector = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.id AS sector_id,
                s.nombre AS sector_nombre,
                s.codigo AS sector_codigo,
                p.id AS parroquia_id,
                p.nombre AS parroquia_nombre,
                p.codigo AS parroquia_codigo,
                m.id AS municipio_id,
                m.nombre AS municipio_nombre,
                m.codigo AS municipio_codigo,
                e.id AS estado_id,
                e.nombre AS estado_nombre,
                e.codigo AS estado_codigo
            FROM sector s
            INNER JOIN parroquia p ON s.parroquia_id = p.id
            INNER JOIN municipio m ON p.municipio_id = m.id
            INNER JOIN estado e ON m.estado_id = e.id
            ORDER BY s.id DESC
        `);

        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los sectores', error);
        next(error);
    }
};

const getSector = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM sector WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error: el sector no se encuentra o es inexistente'
            });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener el sector con id ${id}`, error);
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

const getParroquias = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM parroquia ORDER BY id ASC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo las parroquias', error);
        next(error);
    }
};

const createSector = async (req, res, next) => {
    const { nombre, parroquia_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sector (nombre, parroquia_id) VALUES ($1, $2) RETURNING *',
            [nombre, parroquia_id]
        );

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Sector',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró el sector con nombre: ${nombre}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar el sector', error);
        next(error);
    }
};

const updateSector = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, parroquia_id } = req.body;

    try {
        const oldSector = await pool.query('SELECT * FROM sector WHERE id = $1', [id]);

        const result = await pool.query(
            'UPDATE sector SET nombre = $1, parroquia_id = $2 WHERE id = $3 RETURNING *',
            [nombre, parroquia_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error: el sector no puede ser encontrado o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Sector',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el sector con id: ${id}`,
            datos: { antiguos: oldSector.rows[0], nuevos: result.rows[0] }
        });

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar el sector con id ${id}`, error);
        next(error);
    }
};

const deleteSector = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldSector = await pool.query('SELECT * FROM sector WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM sector WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Error: el sector no se encuentra o es inexistente'
            });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Sector',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el sector: ${oldSector.rows[0]?.nombre || id}`,
            datos: { antiguos: oldSector.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error al eliminar el sector con id: ${id}`, error);
        next(error);
    }
};

module.exports = {
    getAllSector,
    getSector,
    getEstados,
    getMunicipios,
    getParroquias,
    createSector,
    updateSector,
    deleteSector
};
