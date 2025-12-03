const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');
const { crearNotificacionInterna } = require('./notificaciones.controller');

const getAllPacientes = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
                   CASE WHEN COUNT(c.id) > 0 THEN true ELSE false END as has_consultas
            FROM pacientes p
            LEFT JOIN consultas c ON p.id = c.pacientes_id
            GROUP BY p.id
            ORDER BY p.id DESC
        `);
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los pacientes', error);
        next(error);
    }
};

const getPacientes = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, TO_CHAR(p.fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento 
            FROM pacientes p 
            WHERE id = $1 `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener el paciente con id ${id}`, error);
        next(error);
    }
};

const createPaciente = async (req, res, next) => {
    try {
        const {
            cedula, nombre, apellido, sexo, fecha_nacimiento, edad,
            correo, contacto, ubicacion,
            estado_id, municipio_id, parroquia_id, sector_id,
            departamentos_id, cargos_id, profesion_id, estatus
        } = req.body;

        const existe = await pool.query('SELECT * FROM pacientes WHERE cedula = $1', [cedula]);
        if (existe.rows.length > 0) {
            return res.status(409).json({ message: 'La Cédula ya existe' });
        }

        const result = await pool.query(`
            INSERT INTO pacientes (
                cedula, nombre, apellido, sexo, fecha_nacimiento, edad,
                correo, contacto, ubicacion,
                estado_id, municipio_id, parroquia_id, sector_id,
                departamentos_id, cargos_id, profesion_id, estatus
            )
            VALUES (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9,
                $10, $11, $12, $13,
                $14, $15, $16, $17
            )
            RETURNING *`,
            [
                cedula, nombre, apellido, sexo, fecha_nacimiento, edad,
                correo, contacto, ubicacion,
                estado_id, municipio_id, parroquia_id, sector_id,
                departamentos_id, cargos_id, profesion_id, estatus
            ]
        );

        // Notificación de nuevo paciente
        await crearNotificacionInterna(
            req.user.id,
            'Nuevo Paciente Registrado',
            `Se ha registrado al paciente ${nombre} ${apellido} (C.I: ${cedula})`,
            'success'
        );

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Pacientes',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró el paciente ${nombre} ${apellido}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar paciente', error);
        next(error);
    }
};

const updatePaciente = async (req, res, next) => {
    const { id } = req.params;
    const pacienteId = parseInt(id, 10);

    try {
        const {
            cedula, nombre, apellido, sexo, fecha_nacimiento, edad,
            correo, contacto, ubicacion,
            estado_id, municipio_id, parroquia_id, sector_id,
            departamentos_id, cargos_id, profesion_id, estatus
        } = req.body;

        const oldPaciente = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);

        const existe = await pool.query(
            'SELECT id FROM pacientes WHERE cedula = $1 AND id <> $2',
            [cedula, pacienteId]
        );

        if (existe.rows.length > 0) {
            return res.status(409).json({ message: 'La Cédula ya está registrada en otro paciente' });
        }

        const result = await pool.query(`
            UPDATE pacientes SET
                cedula = $1, nombre = $2, apellido = $3, sexo = $4, fecha_nacimiento = $5, edad = $6,
                correo = $7, contacto = $8, ubicacion = $9,
                estado_id = $10, municipio_id = $11, parroquia_id = $12, sector_id = $13,
                departamentos_id = $14, cargos_id = $15, profesion_id = $16, estatus = $17
            WHERE id = $18
            RETURNING *`,
            [
                cedula, nombre, apellido, sexo, fecha_nacimiento, edad,
                correo, contacto, ubicacion,
                estado_id, municipio_id, parroquia_id, sector_id,
                departamentos_id, cargos_id, profesion_id, estatus, id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Error en la solicitud --> Paciente no puede ser encontrado o no existe'
            });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Pacientes',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el paciente con id: ${id}`,
            datos: { antiguos: oldPaciente.rows[0], nuevos: result.rows[0] }
        });

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar el paciente con id: ${id}`, error);
        next(error);
    }
};

const deletePacientes = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldPaciente = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Error en la solicitud --> no se encuentra o no existe'
            });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Pacientes',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el paciente: ${oldPaciente.rows[0]?.nombre || id}`,
            datos: { antiguos: oldPaciente.rows[0] }
        });

        return res.status(204).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al eliminar el paciente con id ${id}`, error);
        next(error);
    }
};

const getEstados = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM estado ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los municipios', error);
        next();
    }
};

const getMunicipios = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre, estado_id FROM municipio ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los municipios', error);
        next();
    }
};

const getParroquias = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre, municipio_id FROM parroquia ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los municipios', error);
        next();
    }
};

const getSectores = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre, parroquia_id FROM sector ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los municipios', error);
        next();
    }
};

const getDepartamentos = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM departamentos ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los departamentos', error);
        next();
    }
};

const getCargos = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM cargos ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los cargos', error);
        next();
    }
};

const getProfesiones = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, carrera FROM profesion ORDER BY carrera ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las profesiones', error);
        next();
    }
};

module.exports = {
    getAllPacientes,
    getPacientes,
    createPaciente,
    updatePaciente,
    deletePacientes,
    getEstados,
    getMunicipios,
    getParroquias,
    getSectores,
    getDepartamentos,
    getCargos,
    getProfesiones
};
