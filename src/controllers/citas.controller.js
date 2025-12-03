const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');
const { crearNotificacionInterna } = require('./notificaciones.controller');

const getAllCitas = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT c.*, 
                   p.nombre as paciente_nombre, p.apellido as paciente_apellido, p.cedula as paciente_cedula,
                   d.nombre as doctor_nombre, d.apellido as doctor_apellido,
                   a.motivo as atencion_motivo
            FROM citas c
            LEFT JOIN pacientes p ON c.pacientes_id = p.id
            LEFT JOIN doctor d ON c.doctor_id = d.id
            LEFT JOIN atenciones a ON c.atenciones_id = a.id
            ORDER BY c.fecha_cita ASC, c.hora_cita ASC
        `);
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo citas:', error);
        next(error);
    }
};

const createCita = async (req, res, next) => {
    try {
        const { fecha_cita, hora_cita, motivo, atenciones_id, pacientes_id, doctor_id, usuarios_id } = req.body;

        const result = await pool.query(
            `INSERT INTO citas (fecha_cita, hora_cita, motivo, atenciones_id, pacientes_id, doctor_id, usuarios_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [fecha_cita, hora_cita, motivo, atenciones_id, pacientes_id, doctor_id, usuarios_id]
        );

        // Si viene de una atención, actualizar estatus de atención a 'agendada'
        if (atenciones_id) {
            await pool.query("UPDATE atenciones SET estatus = 'agendada' WHERE id = $1", [atenciones_id]);
        }

        // Crear notificación para el usuario que creó la cita
        await crearNotificacionInterna(
            req.user.id,
            'Cita Agendada',
            `Se ha programado una cita para el ${fecha_cita} a las ${hora_cita}`,
            'success'
        );

        await registrarBitacora({
            accion: 'Registrar',
            tabla: 'Citas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se agendó una cita para el paciente ID: ${pacientes_id}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando cita:', error);
        next(error);
    }
};

const updateCita = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { fecha_cita, hora_cita, motivo, estatus, doctor_id } = req.body;

        const oldData = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);

        const result = await pool.query(
            `UPDATE citas SET 
                fecha_cita = $1, 
                hora_cita = $2, 
                motivo = $3, 
                estatus = $4, 
                doctor_id = $5
             WHERE id = $6 RETURNING *`,
            [fecha_cita, hora_cita, motivo, estatus, doctor_id, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Cita no encontrada' });

        await registrarBitacora({
            accion: 'Actualizar',
            tabla: 'Citas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó la cita ID: ${id}`,
            datos: { antiguos: oldData.rows[0], nuevos: result.rows[0] }
        });

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando cita:', error);
        next(error);
    }
};

const deleteCita = async (req, res, next) => {
    const { id } = req.params;
    try {
        const oldData = await pool.query('SELECT * FROM citas WHERE id = $1', [id]);
        const result = await pool.query('DELETE FROM citas WHERE id = $1', [id]);

        if (result.rowCount === 0) return res.status(404).json({ message: 'Cita no encontrada' });

        await registrarBitacora({
            accion: 'Eliminar',
            tabla: 'Citas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó la cita ID: ${id}`,
            datos: { antiguos: oldData.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error('Error eliminando cita:', error);
        next(error);
    }
};

const getCitasPendientesByPaciente = async (req, res, next) => {
    const { pacienteId } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id, c.fecha_cita, c.hora_cita, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM citas c
            LEFT JOIN doctor d ON c.doctor_id = d.id
            WHERE c.pacientes_id = $1 
            AND c.estatus IN ('programada', 'confirmada')
            ORDER BY c.fecha_cita ASC, c.hora_cita ASC
        `, [pacienteId]);
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo citas pendientes:', error);
        next(error);
    }
};

const getCitaById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id, c.fecha_cita, c.hora_cita, d.nombre as doctor_nombre, d.apellido as doctor_apellido
            FROM citas c
            LEFT JOIN doctor d ON c.doctor_id = d.id
            WHERE c.id = $1
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Cita no encontrada' });

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo cita por id:', error);
        next(error);
    }
};

module.exports = {
    getAllCitas,
    createCita,
    updateCita,
    deleteCita,
    getCitasPendientesByPaciente,
    getCitaById
};
