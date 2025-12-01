const pool = require('../config/db');

// Obtener todos los seguimientos
const getAllSeguimientos = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM seguimientos ORDER BY fecha_registro DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo seguimientos', error);
        next();
    }
};

// Obtener seguimientos por paciente (a través de consultas)
const getSeguimientosByPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT 
                s.*,
                c.fecha_atencion,
                c.codigo,
                c.diagnostico as diagnostico_consulta,
                d.nombre as medico_nombre,
                d.apellido as medico_apellido
             FROM seguimientos s
             INNER JOIN consultas c ON s.consulta_id = c.id
             LEFT JOIN usuarios u ON s.usuario_id = u.id
             LEFT JOIN doctor d ON u.doctor_id = d.id
             WHERE c.pacientes_id = $1
             ORDER BY s.fecha_registro DESC`,
            [id]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(`Error obteniendo seguimientos del paciente ${id}`, error);
        next();
    }
};

// Obtener seguimiento por ID
const getSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM seguimientos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo seguimiento', error);
        next();
    }
};

// Crear seguimiento
const createSeguimiento = async (req, res, next) => {
    try {
        const { observaciones, recomendaciones, estado_clinico, usuario_id, consulta_id } = req.body;

        const result = await pool.query(
            `INSERT INTO seguimientos (observaciones, recomendaciones, estado_clinico, usuario_id, consulta_id) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [observaciones, recomendaciones, estado_clinico, usuario_id, consulta_id]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando seguimiento:', error);
        return res.status(500).json({
            message: 'Error al crear el seguimiento',
            error: error.message
        });
    }
};

// Actualizar seguimiento
const updateSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const { observaciones, recomendaciones, estado_clinico } = req.body;

        const result = await pool.query(
            `UPDATE seguimientos 
             SET observaciones = $1, recomendaciones = $2, estado_clinico = $3
             WHERE id = $4 
             RETURNING *`,
            [observaciones, recomendaciones, estado_clinico, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando seguimiento', error);
        next();
    }
};

// Eliminar seguimiento
const deleteSeguimiento = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM seguimientos WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Seguimiento no encontrado' });
        }

        return res.json({ message: 'Seguimiento eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando seguimiento', error);
        next();
    }
};

module.exports = {
    getAllSeguimientos,
    getSeguimientosByPaciente,
    getSeguimiento,
    createSeguimiento,
    updateSeguimiento,
    deleteSeguimiento
};
