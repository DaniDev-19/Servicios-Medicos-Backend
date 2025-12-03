const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');
const { crearNotificacionInterna } = require('./notificaciones.controller');

const getAllAtenciones = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.username as usuario_nombre, p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.contacto as paciente_telefono
            FROM atenciones a
            LEFT JOIN usuarios u ON a.usuarios_id = u.id
            LEFT JOIN pacientes p ON a.pacientes_id = p.id
            ORDER BY a.fecha_registro DESC
        `);
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo atenciones:', error);
        next(error);
    }
};

const createAtencion = async (req, res, next) => {
    try {
        const { nombre_solicitante, cedula_solicitante, telefono_solicitante, motivo, prioridad, pacientes_id, usuarios_id } = req.body;

        const result = await pool.query(
            `INSERT INTO atenciones (nombre_solicitante, cedula_solicitante, telefono_solicitante, motivo, prioridad, pacientes_id, usuarios_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre_solicitante, cedula_solicitante, telefono_solicitante, motivo, prioridad, pacientes_id, usuarios_id]
        );

        // Notificación de nueva atención
        await crearNotificacionInterna(
            req.user.id,
            'Nueva Atención Registrada',
            `Se ha registrado una atención para ${nombre_solicitante || 'Paciente'} con prioridad ${prioridad}`,
            'info'
        );

        await registrarBitacora({
            accion: 'Registrar',
            tabla: 'Atenciones',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró una atención para: ${nombre_solicitante || cedula_solicitante}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando atención:', error);
        next(error);
    }
};

const updateAtencion = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { nombre_solicitante, cedula_solicitante, telefono_solicitante, motivo, prioridad, estatus, pacientes_id } = req.body;

        const oldData = await pool.query('SELECT * FROM atenciones WHERE id = $1', [id]);

        const result = await pool.query(
            `UPDATE atenciones SET 
                nombre_solicitante = $1, 
                cedula_solicitante = $2, 
                telefono_solicitante = $3, 
                motivo = $4, 
                prioridad = $5, 
                estatus = $6, 
                pacientes_id = $7 
             WHERE id = $8 RETURNING *`,
            [nombre_solicitante, cedula_solicitante, telefono_solicitante, motivo, prioridad, estatus, pacientes_id, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Atención no encontrada' });

        await registrarBitacora({
            accion: 'Actualizar',
            tabla: 'Atenciones',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó la atención ID: ${id}`,
            datos: { antiguos: oldData.rows[0], nuevos: result.rows[0] }
        });

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando atención:', error);
        next(error);
    }
};

const deleteAtencion = async (req, res, next) => {
    const { id } = req.params;
    try {
        const oldData = await pool.query('SELECT * FROM atenciones WHERE id = $1', [id]);
        const result = await pool.query('DELETE FROM atenciones WHERE id = $1', [id]);

        if (result.rowCount === 0) return res.status(404).json({ message: 'Atención no encontrada' });

        await registrarBitacora({
            accion: 'Eliminar',
            tabla: 'Atenciones',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó la atención ID: ${id}`,
            datos: { antiguos: oldData.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error('Error eliminando atención:', error);
        next(error);
    }
};

module.exports = {
    getAllAtenciones,
    createAtencion,
    updateAtencion,
    deleteAtencion
};
