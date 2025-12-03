const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllProfesion = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM profesion ORDER BY id DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo todas las profesiones', error);
        next();
    }
};

const getProfesion = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM profesion WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '--> Error <-- La Profesión no puede ser encontrada o no existe'
            });
        };

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error en la Solicitud de profesion con id: ${id}`, error);
        next();
    }
};

const createProfesion = async (req, res, next) => {
    try {
        const { nombre, nivel } = req.body;

        const result = await pool.query('INSERT INTO profesion (carrera, nivel) VALUES ($1, $2) RETURNING *',
            [nombre, nivel]
        );

        await registrarBitacora({
            accion: 'Registrar',
            tabla: 'Profesión',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Creo la Profesión: ${nombre}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('--> Error en el Registro de la Profesión <-- Solicitud presentando problemas', error);
        next();
    }
};

const updateProfesion = async (req, res, next) => {
    const { id } = req.params;

    try {
        const { nombre, nivel } = req.body;

        const oldProfesion = await pool.query('SELECT * FROM profesion WHERE id = $1 ', [id]);

        const result = await pool.query('UPDATE profesion SET carrera = $1, nivel = $2 WHERE id = $3 RETURNING *', [nombre, nivel, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '--> Error <-- Solicitud no Existe o imposible de encontrar'
            })
        };

        await registrarBitacora({
            accion: 'Actualizo',
            tabla: 'Profesión',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Actualizo la Profesión: ${nombre}`,
            datos: { antiguos: oldProfesion.rows[0], nuevos: result.rows[0] }
        });

        return res.json(result.rows[0]);

    } catch (error) {
        console.error(`--> Error al Actualizar: id ${id} <-- la Solicitud presenta errores`, error);
        next();
    }
};

const deleteProfesion = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldProfesion = await pool.query('SELECT * FROM profesion WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM profesion WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: '--> Error <-- Solicitud no se encuentra o es inexistente'
            });
        };

        await registrarBitacora({
            accion: 'Elimino',
            tabla: 'Profesión',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Elimino la profesión ${oldProfesion.rows[0]?.carrera || id}`,
            datos: { antiguos: oldProfesion.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`-->Error al Eliminar la Profesion con id: ${id} <--`, error);
        next();
    }
};

module.exports = {
    getAllProfesion,
    getProfesion,
    createProfesion,
    updateProfesion,
    deleteProfesion
};