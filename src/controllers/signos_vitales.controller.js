const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllSignos = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT * FROM signos_vitales ORDER BY id DESC
            `);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener los signos vitales', error);
        next(error);
    }
};

const getSignos = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`SELECT * FROM signos_vitales WHERE id = $1`, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: `Error al mostrar los datos para el id: ${id}`
            });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener los datos para esta solicitud con id: ${id}`, error);
        next(error);
    }
};

const createSignos = async (req, res, next) => {
    try {
        console.log('createSignos - Body recibido:', req.body);
        console.log('createSignos - Usuario:', req.user);

        const { tipo_sangre, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, peso, talla, altura, consulta_id } = req.body;

        // Validación de consulta_id
        if (!consulta_id) {
            return res.status(400).json({
                message: 'El campo consulta_id es requerido'
            });
        }

        const result = await pool.query(`
            INSERT INTO signos_vitales (tipo_sangre, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, peso, talla, altura, consulta_id)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *
            `, [tipo_sangre, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, peso, talla, altura, consulta_id]);

        try {
            await registrarBitacora({
                accion: 'Registro',
                tabla: 'Signos Vitales',
                usuario: req.user?.username || 'Desconocido',
                usuarios_id: req.user?.id || null,
                descripcion: `Se Registraron los Signos Vitales Correspondientes a la Consulta con id: ${consulta_id}`,
                datos: { nuevos: result.rows[0] }
            });
        } catch (bitacoraError) {
            console.error('Error al registrar en bitácora:', bitacoraError);
            // No fallamos la petición si falla la bitácora
        }

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar signos vitales:', error);
        return res.status(500).json({
            message: 'Error interno al registrar signos vitales',
            error: error.message
        });
    }
};

const updateSignos = async (req, res, next) => {
    const { id } = req.params;
    const { tipo_sangre, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, peso, talla, altura, consulta_id } = req.body;
    try {
        const oldSignos = await pool.query('SELECT * FROM signos_vitales WHERE id = $1', [id]);
        const result = await pool.query(`
            UPDATE signos_vitales SET tipo_sangre = $1, presion_arterial = $2, frecuencia_cardiaca = $3, frecuencia_respiratoria = $4, temperatura = $5, saturacion_oxigeno = $6, peso = $7, talla = $8, altura = $9, consulta_id = $10
            WHERE id = $11 RETURNING *
            `, [tipo_sangre, presion_arterial, frecuencia_cardiaca, frecuencia_respiratoria, temperatura, saturacion_oxigeno, peso, talla, altura, consulta_id, id]);

        try {
            await registrarBitacora({
                accion: 'Actualizo',
                tabla: 'Signos Vitales',
                usuario: req.user?.username || 'Desconocido',
                usuarios_id: req.user?.id || null,
                descripcion: `Se Actualizaron los Signos Vitales Correspondientes a la Consulta con id: ${id}`,
                datos: { antiguos: oldSignos.rows[0], nuevos: result.rows[0] }
            });
        } catch (bitacoraError) {
            console.error('Error al registrar en bitácora (update):', bitacoraError);
        }

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar signos vitales con el id: ${id} de la consulta: ${consulta_id}`, error);
        next(error);
    }
};

const deleteSignos = async (req, res, next) => {
    const { id } = req.params;
    try {
        const oldSignos = await pool.query('SELECT * FROM signos_vitales WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM signos_vitales WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Error en la solicitud al parecer no puede eliminarse o ya fue eliminada' })
        }

        try {
            await registrarBitacora({
                accion: 'Elimino',
                tabla: 'Signos Vitales',
                usuario: req.user?.username || 'Desconocido',
                usuarios_id: req.user?.id || null,
                descripcion: `Se Elimino los Signos Vitales con previo Registro ${oldSignos.rows[0]?.nombre || id}`,
                datos: { antiguos: oldSignos.rows[0] }
            });
        } catch (bitacoraError) {
            console.error('Error al registrar en bitácora (delete):', bitacoraError);
        }

        return res.status(204).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al eliminar este registro con id: ${id}`, error);
        next(error);
    }
};

const getSignosByPacienteId = async (req, res, next) => {
    const { id } = req.params; // ID del paciente
    try {
        const result = await pool.query(`
            SELECT sv.*, c.fecha_atencion as fecha_consulta
            FROM signos_vitales sv
            INNER JOIN consultas c ON sv.consulta_id = c.id
            WHERE c.pacientes_id = $1
            ORDER BY sv.id DESC
        `, [id]);

        return res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Error al obtener signos vitales por paciente id: ${id}`, error);
        next(error);
    }
};

module.exports = {
    getAllSignos,
    getSignos,
    createSignos,
    updateSignos,
    deleteSignos,
    getSignosByPacienteId
}
