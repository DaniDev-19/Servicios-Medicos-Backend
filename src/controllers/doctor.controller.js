const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllDoctores = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT doctor.*, c.nombre AS cargo_nombre, p.nombre AS profesion_nombre 
            FROM doctor 
            LEFT JOIN cargos c ON doctor.cargos_id = c_id
            LEFT JOIN profesion p ON doctor.profesion_id = p.id
            WHERE doctor.estado = TRUE
            ORDER BY doctor.id DESC`);

            return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los doctores', error);
        next();
    }
};

const getDoctor = async (req, res, next) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT doctor.*, c.nombre AS cargo_nombre, p.nombre AS profesion_nombre 
            FROM doctor 
            LEFT JOIN cargos c ON doctor.cargos_id = c_id
            LEFT JOIN profesion p ON doctor.profesion_id = p.id
            WHERE doctor.estado = TRUE AND doctor.id = $1`, [id]);

            if(result.rows.lenght === 0){
                return res.status(404).json({
                    message: 'Error en la solicitud --> no puede ser encontrada o no existe'
                });
            }
            return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error al solicitar el doctor con id: ${id}`, error);
        next();
    }
};

const getCargos = async (req, res, next) => {
    try{
        const result = await pool.query('SELECT id, nombre FROM cargos ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    }catch(error){
        console.error('Error al obtener todos los cargos', error);
        next(error);
    }
};

const getProfesion = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM profesion ORDER BY nombre ASC');
        return result.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las profesiones, error');
        next(error);
    }
};

const createDoctor = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const {cedula, nombre, apellido, contacto, cargos_id, profesion_id} = req.body;

        const existe = await pool.query('SELECT * FROM doctor WHERE cedula = $1', [cedula]);

        if(existe.rows.lenght > 0){
            return res.status(409).json({message: 'La cédula ya existe'});
        }

        const result = await pool.query(`
            INSERT INTO doctor (cedula, nombre, apellido, contacto, cargos_id, profesion_id, estado)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *
            `, 
            [cedula, nombre, apellido, contacto, cargos_id, profesion_id]);

            await registrarBitacora({
                accion: 'Registrar',
                tabla: 'Doctores',
                usuario: req.user.username,
                userios_id: req.user.id,
                descripcion: `Se Registro el doctor con nombre: ${nombre}`,
                datos: {nuevos: result.rows[0]}
            });

            return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar doctor', error);
        next();
    }
};

const updateDoctor = async (req, res, next) => {
    const { id } = req.params;

    try {
        const {cedula, nombre, apellido, contacto, cargos_id, profesion_id, estado} = req.body;

        const oldDoctor = await pool.query('SELECT * FROM doctor WHERE id = $1', [id]);

        const existe = await pool.query('SELECT * FROM doctor WHERE cedula =_ $1', [cedula]);
        if(existe.rows.length > 0){return res.status(409).json({
            message: 'La cédula ya existe'
        });
    }

        const result = await pool.query(`
            UPDATE doctor SET cedula = $1, nombre = $2, apellido = $3, contacto = $4, cargos_id = $5, profesion = $6, estado = $7 WHERE id = $8 RETURNING *`,
            [cedula, nombre, apellido, contacto, cargos_id, profesion_id, estado, id]);
            
            await registrarBitacora({
                accion: 'Actualizo',
                tabla: 'Doctores',
                usuario: req.user.username,
                usuarios_id: req.user.id,
                descripcion: `Se Actualizo el doctor con id: ${id}`,
                datos: {antiguos: oldDoctor.rows[0], nuevos: result.rows[0]}
            });

            return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar el doctor con id: ${id}`, error);
        next(error);
    }
};

const deleteDoctor = async (req, res, next) => {
    const { id } = req.params;

    try{
        const oldDoctor = await pool.query('SELECT * FROM doctor WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM doctor WHERE id = $1 RETURNING *', [id]);
        if(result.rowCount === 0){
            return res.status(404).json({
                message: 'Error en la Solicitud --> no puede encontrar o no existe'
            });
        }

        await registrarBitacora({
            accion: 'Elimino',
            tabla: 'Doctores',
            usuario: req.user.username,
            usarios_id: req.user.id,
            descripcion: `Se elimino el Doctor con id: ${id}`,
            datos: {antiguos: oldDoctor.rows[0]}
        });

        return res.sendStatus(204)
    }catch(error){
        console.error(`Error al eliminar el doctor con id ${id}`, error);
        next();
    }
};

module.exports = {
    getAllDoctores,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getCargos,
    getProfesion
}