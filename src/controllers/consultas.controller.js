const pool = require('../config/db');
const registrarBitacora = require('../helpers/registerBitacora');

const getAllConsultas = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT * FROM consultas ORDER BY fecha_atencion DESC
            `);

            return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los datos de las consultas' ,error);
        next(error);
    }
};

const getConsultas = async (req, res, next) => {
    const {id} = req.paramas;

    try {
        const result = await pool.query(`
            SELECT * FROM consultas WHERE id = $1
            `,[id]);

        const  consultas = result.rows[0];

        const consulta_medicamentos = await pool.query(`
            SELECT 
            m.id AS medicamento_id,
            m.nombre AS medicamento_nombre,
            m.presentacion AS medicamento_presentacion,
            m.miligramos AS medicamentos_miligramos,
            cm.cantidad_utilizada AS cantidad_utilizada
            FROM consulta_medicamentos cm
            INNER JOIN  medicamentos m ON cm.medicamento_id = m.id
            WHERE cm.consulta_id = $1`, [consultas.id]);

            consultas.detalle = consulta_medicamentos.rows;

            return res.status(200).json(consultas);
    } catch (error) {
        console.error(`Error al obtener los datos para esta consutla con id ${id}`, error);
        next(error);
    }
};

const createConsultas = async (req, res, next) => {
    const {diagnostico, tratamientos, observaciones, historias_medicas_id, enfermedades_id, medicamentos_ids} = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(`INSERT INTO consultas (diagnostico, tratamientos, observaciones, historias_medicas_id, enfermedades_id, estado)
            VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`, 
            [diagnostico, tratamientos, observaciones, historias_medicas_id, enfermedades_id]); 

           const  consultasId = result.rows[0];

           if(Array.isArray(medicamentos_ids)){
                for(const medi of medicamentos_ids){
                    await client.query(`INSERT INTO consulta_medicamentos (consulta_id, medicamento_id, cantidad_utilizada)`, 
                        [consultasId, medi.medicamento_id, medi.cantidad_utilizada]);
                };
           }

           await registrarBitacora({
            accion: 'Registro',
            tabla: 'Consultas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se registro una consulta con la id: ${consultasId}`,
            datos: {nuevos: result.rows[0]}
           });

           await client.query('COMMIT')
           return res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('error al registrar la consulta', error);
        next(error);
    } finally {
        client.release();
    }
}; 

const updateConsulta = async (req, res, next) => {
    const {id} = req.params;
    const {diagnostico, tratamientos, observaciones, historias_medicas_id, enfermedades_id, estado, medicamentos_ids} = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const oldConsultas = client.query('SELECT * FROM consultas WHERE id = $1', [id]);
        const result = await client.query(`
            UPDATE consultas SET diagnostico = $1, tratamientos = $2, observaciones = $3, historias_medicas_id = $4, enfermedades_id = $5, estado = $6
            WHERE id = $7 RETURNING *
            `, [diagnostico, tratamientos, observaciones, historias_medicas_id, enfermedades_id, estado, id]);

            await client.query('DELETE FROM consuta_medicamentos WHERE consulta_id = $1', [id]);
            if(Array.isArray(medicamentos_ids)){
                for(const medi of medicamentos_ids){
                    await client.query(`INSERT INTO consulta_medicamentos (consulta_id, medicamento_id, cantidad_utilizada)`, 
                        [id, medi.medicamento_id, medi.cantidad_utilizada]);
                };
            }

              await registrarBitacora({
                accion: 'Actualizar',
                tabla: 'Consultas',
                usuario: req.user.username,
                usuarios_id: req.user.id,
                descripcion: `Se Actualizo la consulta con id: ${id}`,
                datos: {antiguos: oldConsultas.rows[0], nuevos: result.rows[0]}
            });
            await client.query('COMMIT');
            return res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK'),
        console.error(`Error al actualizar la consutla con id ${id}`, error);
        next(error);
    } finally {
        client.release();
    }
};

const deleteConsulta = async (req, res, next) => {
    const {id} = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM consuta_medicamentos WHERE consulta_id = $1', [id]);
        const oldConsultas = client.query('SELECT * FROM consultas WHERE id = $1', [id]);
        const result = await client.query('DELETE FROM consultas WHERE id = $1', [id]);
        
        if(result.rowCount === 0) {
            return res.status(404).json({
                message: 'Error Solicitud no se encuentra o es inexistente'
            });
        };

        await registrarBitacora({
            accion: 'ELIMINO',
            tabla: 'Consultas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se eliminó el Departamento ${oldConsultas.rows[0]?.nombre || id}`,
            dato: { antiguos: oldConsultas.rows[0] }
        });

        await client.query('COMMIT');
        return res.sendStatus(204);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al eliminar la consulta con id: ${id}`)
        next(error);
    } finally {
        client.release();
    }
}; 

const getEnfermedades = async (req, res, next) => {
    try{
        const result = await pool.query('SELECT id, nombre FROM enfermedades ORDER BY nombre ASC');
        return res.json(result.rows);
    }catch(error) {
        console.error('Error al obtener las enfermedades', error);
        next();
    }
};

const getMedicamentos = async (req, res, next) => {
    try{
        const result = await pool.query('SELECT id, nombre FROM medicamentos ORDER BY nombre ASC');
        return res.json(result.rows);
    }catch(error) {
        console.error('Error al obtener medicamentos', error);
        next();
    }
};

module.exports = {
    getAllConsultas,
    getConsultas,
    createConsultas,
    updateConsulta,
    deleteConsulta,
    getEnfermedades,
    getMedicamentos
}