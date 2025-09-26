const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');


const getAllMedicamentos = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT m.*, c.nombre AS categoria_nombre
            FROM medicamentos m
            LEFT JOIN categoria_m c ON m.categoria_m_id = c.id
            ORDER BY m.id DESC
        `);

        const medicamentos = result.rows;

        for (const med of medicamentos) {
            const movimientosRes = await pool.query(`
                SELECT mm.id, mm.tipo_movimiento, mm.cantidad, mm.fecha, mm.motivo,
                       u.username AS usuario
                FROM movimientos_medicamentos mm
                LEFT JOIN usuarios u ON mm.usuario_id = u.id
                WHERE mm.medicamento_id = $1
                ORDER BY mm.fecha DESC
            `, [med.id]);

            med.movimientos_detalle = movimientosRes.rows.map(mov =>
                `${mov.tipo_movimiento.toUpperCase()} - ${mov.cantidad} unidades el ${new Date(mov.fecha).toLocaleDateString()} por ${mov.usuario} (Motivo: ${mov.motivo})`
            ).join('<br>');

            med.movimientos = movimientosRes.rows;
        }

        return res.json(medicamentos);
    } catch (error) {
        console.error('Error al obtener medicamentos:', error);
        next(error);
    }
};


const getMedicamento = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT m.*, c.nombre AS categoria_nombre
            FROM medicamentos m
            LEFT JOIN categoria_m c ON m.categoria_m_id = c.id
            WHERE m.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }

        const medicamento = result.rows[0];

        const movimientosRes = await pool.query(`
            SELECT mm.id, mm.tipo_movimiento, mm.cantidad, mm.fecha, mm.motivo,
                   u.username AS usuario
            FROM movimientos_medicamentos mm
            LEFT JOIN usuarios u ON mm.usuario_id = u.id
            WHERE mm.medicamento_id = $1
            ORDER BY mm.fecha DESC
        `, [id]);

        medicamento.movimientos = movimientosRes.rows;

        return res.json(medicamento);
    } catch (error) {
        console.error(`Error al obtener medicamento con id: ${id}`, error);
        next(error);
    }
};


const createMedicamento = async (req, res, next) => {
    const { nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id, movimientos } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO medicamentos (nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `, [nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id]);

        const medicamentoId = result.rows[0].id;

        if (Array.isArray(movimientos)) {
            for (const mov of movimientos) {
                await client.query(`
                    INSERT INTO movimientos_medicamentos (medicamento_id, tipo_movimiento, cantidad, usuario_id, motivo)
                    VALUES ($1, $2, $3, $4, $5)
                `, [medicamentoId, mov.tipo_movimiento, mov.cantidad, req.user.id, mov.motivo]);
            }
        }

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Medicamentos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registró el medicamento: ${nombre}`,
            datos: { nuevos: result.rows[0] }
        });

        await client.query('COMMIT');
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar medicamento:', error);
        next(error);
    } finally {
        client.release();
    }
};


const updateMedicamento = async (req, res, next) => {
    const { id } = req.params;
    const { nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id, movimientos } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const oldMedicamento = await client.query('SELECT * FROM medicamentos WHERE id = $1', [id]);

        const result = await client.query(`
            UPDATE medicamentos SET nombre = $1, presentacion = $2, miligramos = $3,
            cantidad_disponible = $4, estatus = $5, estado = $6, categoria_m_id = $7,
            fecha_ultima_actualizacion = NOW()
            WHERE id = $8 RETURNING *
        `, [nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id, id]);

        await client.query('DELETE FROM movimientos_medicamentos WHERE medicamento_id = $1', [id]);

        if (Array.isArray(movimientos)) {
            for (const mov of movimientos) {
                await client.query(`
                    INSERT INTO movimientos_medicamentos (medicamento_id, tipo_movimiento, cantidad, usuario_id, motivo)
                    VALUES ($1, $2, $3, $4, $5)
                `, [id, mov.tipo_movimiento, mov.cantidad, req.user.id, mov.motivo]);
            }
        }

        await registrarBitacora({
            accion: 'Actualizar',
            tabla: 'Medicamentos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el medicamento: ${nombre}`,
            datos: { antiguos: oldMedicamento.rows[0], nuevos: result.rows[0] }
        });

        await client.query('COMMIT');
        return res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al actualizar medicamento con id: ${id}`, error);
        next(error);
    } finally {
        client.release();
    }
};


const deleteMedicamento = async (req, res, next) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const oldMedicamento = await client.query('SELECT * FROM medicamentos WHERE id = $1', [id]);

        await client.query('DELETE FROM movimientos_medicamentos WHERE medicamento_id = $1', [id]);
        await client.query('DELETE FROM medicamentos WHERE id = $1', [id]);

        await registrarBitacora({
            accion: 'Eliminar',
            tabla: 'Medicamentos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el medicamento ${oldMedicamento.rows[0]?.nombre || id}`,
            datos: { antiguos: oldMedicamento.rows[0] }
        });

        await client.query('COMMIT');
        return res.sendStatus(204);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar medicamento:', error);
        next(error);
    } finally {
        client.release();
    }
};

const getCategoriaM = async (req, res, next) => {
    try{
        const result = await pool.query('SELECT id, nombre FROM categoria_m ORDER BY nombre DESC');
        return res.status(200).json(result.rows);
    }catch(error){
        console.error('Error al obtener todas las categorias' ,error);
        next();
    }
};

module.exports = {
    getAllMedicamentos,
    getMedicamento,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento,
    getCategoriaM
};
