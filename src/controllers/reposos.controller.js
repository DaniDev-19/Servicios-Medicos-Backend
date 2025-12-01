const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllReposos = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM reposos ORDER BY id DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo todos los reposos', error);
        next();
    }
};


const getReposo = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM reposos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'El reposo no existe o no se encuentra' });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error obteniendo reposo con id: ${id}`, error);
        next();
    }
};


const createReposo = async (req, res, next) => {
    try {
        const {
            fecha_inicio,
            fecha_fin,
            hora_fin,
            diagnostico,
            observacion,
            consulta_id,
            pacientes_id,
            usuarios_id
        } = req.body;

        const result = await pool.query(
            `INSERT INTO reposos (
                fecha_inicio, fecha_fin, hora_fin, diagnostico, observacion,
                consulta_id, pacientes_id, usuarios_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [fecha_inicio, fecha_fin, hora_fin, diagnostico, observacion, consulta_id, pacientes_id, usuarios_id]
        );

        await registrarBitacora({
            accion: 'Registrar',
            tabla: 'Reposos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró un reposo para el paciente: ${pacientes_id}`,
            datos: { nuevos: result.rows[0] }
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando reposo:', error);
        // Devolver error 500 explícito para ver qué pasó
        return res.status(500).json({
            message: 'Error al crear el reposo en base de datos',
            error: error.message
        });
    }
};


const updateReposo = async (req, res, next) => {
    const { id } = req.params;
    try {
        const {
            fecha_inicio,
            fecha_fin,
            hora_fin,
            diagnostico,
            observacion,
            estado,
            consulta_id,
            pacientes_id,
            usuarios_id
        } = req.body;

        const oldReposo = await pool.query('SELECT * FROM reposos WHERE id = $1', [id]);

        const result = await pool.query(
            `UPDATE reposos SET
                fecha_inicio = $1,
                fecha_fin = $2,
                hora_fin = $3,
                diagnostico = $4,
                observacion = $5,
                estado = $6,
                consulta_id = $7,
                pacientes_id = $8,
                usuarios_id = $9
            WHERE id = $10 RETURNING *`,
            [fecha_inicio, fecha_fin, hora_fin, diagnostico, observacion, estado, consulta_id, pacientes_id, usuarios_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reposo no encontrado o no se pudo actualizar' });
        }

        await registrarBitacora({
            accion: 'Actualizó',
            tabla: 'Reposos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el reposo con id: ${id}`,
            datos: { antiguos: oldReposo.rows[0], nuevos: result.rows[0] }
        });

        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error actualizando reposo con id: ${id}`, error);
        next();
    }
};


const deleteReposo = async (req, res, next) => {
    const { id } = req.params;
    try {
        const oldReposo = await pool.query('SELECT * FROM reposos WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM reposos WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Reposo no encontrado o ya eliminado' });
        }

        await registrarBitacora({
            accion: 'Eliminó',
            tabla: 'Reposos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el reposo con código: ${oldReposo.rows[0]?.codigo || id}`,
            datos: { antiguos: oldReposo.rows[0] }
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error(`Error eliminando reposo con id: ${id}`, error);
        next();
    }
};

const actualizarEstadosReposos = async () => {
    try {
        await pool.query('SELECT actualizar_estado_reposos();');
        console.log('Estados de reposos actualizados correctamente');
    } catch (error) {
        console.error('Error actualizando estados de reposos', error);
    }
};

const getRepososByPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Ordenar: primero activos, luego por fecha más reciente
        const result = await pool.query(
            `SELECT * FROM reposos 
             WHERE pacientes_id = $1 
             ORDER BY 
                CASE 
                    WHEN estado = 'activo' THEN 1 
                    WHEN estado = 'finalizado' THEN 2 
                    ELSE 3 
                END,
                fecha_inicio DESC`,
            [id]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error(`Error obteniendo reposos del paciente ${id}`, error);
        next();
    }
};

module.exports = {
    getAllReposos,
    getReposo,
    getRepososByPaciente,
    createReposo,
    updateReposo,
    deleteReposo,
    actualizarEstadosReposos
};
