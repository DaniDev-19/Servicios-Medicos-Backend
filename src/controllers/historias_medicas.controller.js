const pool = require('../config/db');
const registrarBitacora = require('../helpers/registerBitacora');


const getAllHistoriasM = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT 
                TO_CHAR(hr.fecha_consulta, 'DD/MM/YY HH24:MI') AS fecha_consulta,
                TO_CHAR(hr.fecha_alta, 'DD/MM/YY HH24:MI') AS fecha_alta,
                hr.codigo AS codigo_historia,
                p.cedula AS cedula_paciente,
                p.apellido AS apellido_paciente,
                dc.cedula AS cedula_doctor,
                dc.apellido AS apellido_doctor
            FROM historias_medicas hr
            INNER JOIN pacientes p ON hr.pacientes_id = p.id
            INNER JOIN usuarios u ON hr.usuarios_id = u.id
            INNER JOIN doctor dc ON u.doctor_id = dc.id 
            ORDER BY hr.fecha_consulta DESC
            `);

            return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las historias medicas', error);
        next(error);
    }
};

const getHistoriasM = async (req, res, next) => {
    const { id } = req.params;

    try{
        const result = await pool.query(`
            SELECT hr.*,
                p.cedulas AS cedula_paciente, 
                p.nombre AS nombre_paciente,
                p.apellido AS apellido_paciente,
                p.sexo AS sexo_paciente,
                TO_CHAR(p.fecha_nacimiento, 'DD/MM/YY HH24:MI') AS fecha,
                p.edad AS edad_paciente,
                p.correo AS correo_paciente,
                p.contacto AS contacto_paciente,
                p.codigo_territorial AS codigoTerritorial_paciente,
                p.ubicacion AS ubicacion_paciente,
                e.id AS estado_id,
                e.nombre AS estado_nombre_paciente,
                m.id AS municipio_id,
                m.nombre AS municipio_nombre_paciente,
                pr.id AS parroquia_id,
                pr.nombre AS parroquia_nombre_paciente,
                s.id AS sector_id,
                s.nombre AS sector_nombre_paciente,
                d.id AS departamento_id,
                d.nombre AS departamento_nombre_paciente,
                c.id AS cargo_id,
                c.nombre AS cargo_nombre_paciente,
                prf.id AS profesion_id,
                prf.nombre AS profesion_nombre_paciente,
                dc.id AS doctor_id,
                dc.cedula AS cedula_doctor,
                dc.nombre AS nombre_doctor,
                dc.apellido AS apellido_doctor,
                dc.contacto AS contacto_doctor,
                cd.id AS cargo_id_doctor,
                cd.nombre AS cargo_nombre_doctor,
                prd.id AS profesion_id_doctor,
                prd.nombre AS profesion_nombre_doctor,
            FROM historias_medicas hr
            INNER JOIN pacientes p ON hr.pacientes_id = p.id
            INNER JOIN usuarios u ON hr.usuario_id = u.id
            INNER JOIN estado e ON p.estado_id = e.id
            INNER JOIN municipio m ON p.municipio_id = m.id
            INNER JOIN parroquia pr ON p.parroquia_id = pr.id
            INNER JOIN sector s ON p.sector_id = s.id
            INNER JOIN departamentos d ON p.departamento_id = d.id
            INNER JOIN cargos c ON p.cargo_id = c.id
            INNER JOIN profesion prf ON p.profesion_id = prf.id
            INNER JOIN doctor dc ON u.doctor_id = dc.id
            INNER JOIN cargos cd ON dc.cargo_id = cd.id
            INNER JOIN profesion prd ON dc.profesion_id = prd.id
            WHERE hr.id = $1 AND hr.estado = TRUE; 
            `);

        if(result.rows.length === 0){
            return res.status(404).json({
                message: 'Error al obtener esta solicitud --> no puede encontrarse o no existe'
            });
        }

        const historias = result.rows[0];

        const historia_enfermedad = await pool.query(`
            SELECT 
            enf.id AS enfermedad_id,
            enf.nombre AS enfermedad_nombre,
            cate.id AS categoria_e_id,
            cate.nombre AS categoria_nombre
            FROM historia_enfermedades hef
            INNER JOIN  enfermedades enf ON hef.enfermedad_id = enf.id
            INNER JOIN categoria_e cate ON enf.categoria_e_id = cate.id
            WHERE hef.historia_id = $1 `, [historias.id]);

            historias.detalle = historia_enfermedad.rows;

        return res.status(200).json(historias);
        }catch(error) {
            console.error(`Error al obtener la historia medica con id: ${id}`);
            next();
        }
};

const createHistoriaM = async (req, res, next) => {
     const client = await pool.connect(); 
    try {
        await client.query('BEGIN');

        const {fecha_consulta, fecha_alta, motivo_consulta, historia, examen_fisico, diagnostico, observacion, pacientes_id, usuarios_id, enfermedades_ids} = req.body
        const result = await client.query(`
            INSERT INTO historias_medicas (fecha_consulta, fecha_alta, motivo_consulta, historia, examen_fisico, diagnostico, observacion, pacientes_id, usuarios_id, estado)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE) RETURNING *`
            [fecha_consulta, fecha_alta, motivo_consulta, historia, examen_fisico, diagnostico, observacion, pacientes_id, usuarios_id]
        ); 

        const historiaId = result.rows[0].id;

        if (Array.isArray(enfermedades_ids)){
            for(const enfer of enfermedades_ids){
                await client.query('INSERT INTO historias_enfermedades (historia_id, enfermedad_id)', 
                    [historiaId, enfer.enfermedad_id])
            };
        }

        await registrarBitacora({
            accion: 'Registro',
            tabla: 'Historias Médicas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Registro la historia medica con codigo: ${codigo}`,
            datos: {nuevos: result.rows[0]}
        });

        await client.query('COMMIT');
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar historia médica', error);
        next(error);
    }
};

const updateHistoriaM = async (req, res, next) => {
    const { id } = req.params;
    const {fecha_consulta, fecha_alta, motivo_consulta, historia, examen_fisico, diagnostico, observacion, pacientes_id, usuarios_id, estado, enfermedades_ids}= req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const oldHistoriaM = await pool.query('SELECT * FROM historias_medicas WHERE id = $1', [id]);
        
        const result = await pool.query(`
            UPDATE historias_medicas SET fecha_consulta = $1, fecha_alta = $2, motivo_consulta = $3, historia = $4, examen_fisico = $5, diagnostico = $6, observacion = $7, pacientes_id = $8, usuarios_id = $9, estado = 10
            WHERE id = $11 RETURNING *
            `, [fecha_consulta, fecha_alta, motivo_consulta, historia, examen_fisico, diagnostico, observacion, pacientes_id, usuarios_id, estado, id]);
          
           await client.query('DELETE FROM historia_enfermedades  WHERE historia_id = $1', [id]);
            if(Array.isArray(enfermedades_ids)){
                for(const enfer of enfermedades_ids){
                    await client.query('INSERT INTO historia_enfermedades (historia_id, enfermedad_id)', 
                        [id, enfer.finalidades_id]);
                }
            }
        
          if(result. rows.length === 0){
            return res.status(404).json({message: 'La Historia medica no puede ser encontrada o no se puede actualizar'});
          }

          await registrarBitacora({
            accion: 'Actualizo',
            tabla: 'Historias Médicas',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Actualizo la Historia medica con id: ${id}`,
            datos: {antiguos: oldHistoriaM.rows[0] ,nuevos: result.rows[0]}
          });
          await client.query('COMMIT');
          return res.status(200).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error al actualzar la historia con id: ${id}`, error);
        next(error);
    } finally {
       client.release();
    }
};

const deleteHistoriaM = async (req, res, next) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM historia_departamentos WHERE historia_id = $1', [id]);
        const oldHistoriaM = await pool.query('SELECT * FROM historias_medicas WHERE id = $1', [id]);
        const result = await pool.query('DELETE FROM historias_medicas WHERE id = $1', [id]);

       if(result.rowCount === 0){
        return res.status(404).json({
            message: 'La historia no puede eliminarse o o ya fue eliminada'
        });
       }

       await registrarBitacora({
        accion: 'Elimino',
        tabla: 'Historias Médicas',
        usuario: req.user.username,
        usuarios_id: req.user.id,
        descripcion: `Se elimino La Historia Médica: ${oldHistoriaM.rows[0]?.nobre || id}`,
        datos: {antiguos: oldHistoriaM.rows[0]}
       });

       await client.query('COMMIT');
       return res.sendStatus(204);
    } catch (error) {
         await client.query('ROLLBACK');
        console.error(`Error al eliminar la historia medica con id: ${id}`, error);
        next(error);
    }finally {
        client.release();
    }
};

const getPacientes = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, cedula, nombre, FROM pacientes ORDER BY cedula ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los pacientes', error);
        next(error);
    }
};

const getEnfermedades = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, cedula, nombre, FROM enfermedades ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los pacientes', error);
        next(error);
    }
};

module.exports = {
    getAllHistoriasM,
    getHistoriasM,
    createHistoriaM,
    updateHistoriaM,
    deleteHistoriaM,
    getPacientes,
    getEnfermedades
};