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
    // Extraemos cantidad_disponible para manejarla aparte
    const { nombre, presentacion, miligramos, cantidad_disponible, estatus, estado, categoria_m_id } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Obtener datos actuales
        const oldMedicamentoRes = await client.query('SELECT * FROM medicamentos WHERE id = $1', [id]);
        if (oldMedicamentoRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Medicamento no encontrado' });
        }
        const oldMedicamento = oldMedicamentoRes.rows[0];
        const oldCantidad = oldMedicamento.cantidad_disponible;
        const newCantidad = parseInt(cantidad_disponible);

        // 2. Actualizar datos básicos (SIN actualizar cantidad_disponible directamente en el SET si usamos trigger, 
        // pero como el trigger suma/resta, aquí solo actualizamos campos descriptivos. 
        // La cantidad se ajustará via movimientos).

        // Sin embargo, si queremos soportar la edición directa del número en el form:
        // Calculamos la diferencia
        const diferencia = newCantidad - oldCantidad;

        // Actualizamos campos descriptivos
        const result = await client.query(`
            UPDATE medicamentos SET nombre = $1, presentacion = $2, miligramos = $3,
            estado = $4, categoria_m_id = $5,
            fecha_ultima_actualizacion = NOW()
            WHERE id = $6 RETURNING *
        `, [nombre, presentacion, miligramos, estado, categoria_m_id, id]);

        // 3. Manejo inteligente del inventario (NO BORRAR HISTORIAL)
        if (diferencia !== 0) {
            const tipo = diferencia > 0 ? 'entrada' : 'salida';
            const cantAbs = Math.abs(diferencia);

            // Insertar movimiento de ajuste
            await client.query(`
                INSERT INTO movimientos_medicamentos (medicamento_id, tipo_movimiento, cantidad, usuario_id, motivo)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, tipo, cantAbs, req.user.id, 'Ajuste manual de inventario en Edición']);

            // El trigger 'trg_actualizar_cantidad_medicamento' se encargará de actualizar 'cantidad_disponible' 
            // y 'estatus' en la tabla medicamentos automáticamente.
        }
        // Si la diferencia es 0, no tocamos la cantidad ni el historial

        // Recuperamos el registro actualizado final (post-trigger)
        const finalMedicamento = await client.query('SELECT * FROM medicamentos WHERE id = $1', [id]);

        await registrarBitacora({
            accion: 'Actualizar',
            tabla: 'Medicamentos',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se actualizó el medicamento: ${nombre} (Ajuste stock: ${diferencia})`,
            datos: { antiguos: oldMedicamento, nuevos: finalMedicamento.rows[0] }
        });

        await client.query('COMMIT');
        return res.json(finalMedicamento.rows[0]);
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
    try {
        const result = await pool.query('SELECT id, nombre FROM categoria_m ORDER BY nombre DESC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las categorias', error);
        next();
    }
};

const getAllMovimientos = async (req, res, next) => {
    try {
        // Query complejo para intentar extraer el ID de consulta del texto 'motivo' y buscar su código
        // Asumiendo que el motivo tiene formato "Uso en consulta ID: <numero>"
        const result = await pool.query(`
            SELECT 
                mm.id, 
                mm.tipo_movimiento, 
                mm.cantidad, 
                mm.fecha, 
                mm.motivo,
                m.nombre AS medicamento, 
                u.username AS usuario,
                -- Intentar extraer ID de consulta si el motivo coincide con el patrón
                CASE 
                    WHEN mm.motivo ~ 'ID: [0-9]+' THEN 
                        SUBSTRING(mm.motivo FROM 'ID: ([0-9]+)')::INT 
                    ELSE NULL 
                END AS extracted_consulta_id
            FROM movimientos_medicamentos mm
            JOIN medicamentos m ON mm.medicamento_id = m.id
            LEFT JOIN usuarios u ON mm.usuario_id = u.id
            ORDER BY mm.fecha DESC
        `);

        // Procesar resultados para reemplazar ID con Código si es posible
        const movimientos = result.rows;

        // Recolectar IDs de consultas a buscar
        const consultaIds = movimientos
            .map(m => m.extracted_consulta_id)
            .filter(id => id); // Filtrar nulos

        let consultaMap = {};
        if (consultaIds.length > 0) {
            const consultasRes = await pool.query(`
                SELECT id, codigo FROM consultas WHERE id = ANY($1::int[])
            `, [consultaIds]);

            consultaMap = consultasRes.rows.reduce((acc, curr) => {
                acc[curr.id] = curr.codigo;
                return acc;
            }, {});
        }

        // Formatear respuesta
        const formatted = movimientos.map(mov => {
            let motivoFinal = mov.motivo;
            if (mov.extracted_consulta_id && consultaMap[mov.extracted_consulta_id]) {
                const codigo = consultaMap[mov.extracted_consulta_id];
                // Si es un uso en consulta
                if (mov.motivo.includes('Uso en consulta ID:')) {
                    motivoFinal = `Uso en consulta: ${codigo}`;
                }
                // Si es una devolución automática (eliminación/edición)
                else if (mov.motivo.toLowerCase().includes('devolución')) {
                    motivoFinal = `Devolución (Consulta: ${codigo})`;
                }
                // Fallback genérico: reemplazo directo del ID si no calza con los anteriores pero tiene el ID
                else {
                    motivoFinal = mov.motivo.replace(`ID: ${mov.extracted_consulta_id}`, `Código: ${codigo}`);
                }
            }

            return {
                id: mov.id,
                tipo_movimiento: String(mov.tipo_movimiento), // Asegurar string
                cantidad: mov.cantidad,
                fecha: mov.fecha,
                motivo: motivoFinal,
                medicamento: mov.medicamento,
                usuario: mov.usuario ? String(mov.usuario) : null // Asegurar string o null
            };
        });

        return res.json(formatted);
    } catch (error) {
        console.error('Error al obtener todos los movimientos:', error);
        next(error);
    }
};

const getMedicamentosByPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                m.nombre AS medicamento,
                m.presentacion,
                cm.cantidad_utilizada AS cantidad,
                c.fecha_atencion AS fecha,
                c.codigo AS consulta_codigo,
                e.nombre AS enfermedad
            FROM consultas c
            JOIN consulta_medicamentos cm ON c.id = cm.consulta_id
            JOIN medicamentos m ON cm.medicamento_id = m.id
            LEFT JOIN enfermedades e ON c.enfermedades_id = e.id
            WHERE c.pacientes_id = $1
            ORDER BY c.fecha_atencion DESC
        `, [id]);

        return res.json(result.rows);
    } catch (error) {
        console.error(`Error al obtener medicamentos del paciente ${id}`, error);
        next(error);
    }
};

module.exports = {
    getAllMedicamentos,
    getMedicamento,
    createMedicamento,
    updateMedicamento,
    deleteMedicamento,
    getCategoriaM,
    getAllMovimientos,
    getMedicamentosByPaciente
};
