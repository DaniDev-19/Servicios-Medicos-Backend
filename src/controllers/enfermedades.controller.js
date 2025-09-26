const pool = require('../config/db');
const registrarBitacora = require('../helpers/registerBitacora');

const getAllEnfermedades = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT enfermedades.*, ce.id AS categoria_e_id, ce.nombre AS categoria_e_nombre 
            FROM enfermedades 
            LEFT JOIN categoria_e ce ON enfermedades.categoria_e_id = ce.id
            ORDER BY id DESC`);
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los datos' ,error);
    }
};

const getEnfermedades = async (req, res, next) => {
    const { id } = req.paramas;

    try {
        const result = await pool.query('SELECT * FROM enfermedades WHERE id = $1', [id]);

        if(result.rows.length === 0){
            return res.status(404).json({
                message: ' Error en la solicitud --> no se puede encuentrar o no existe'
            });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al obtener la enfermedad con id: ${id}`, error);
        next();
    }
};

const createEnfermedad = async (req, res, next) => {
    try {
        const {nombre, descripcion, categoria_e_id} = req.body;

        if(!nombre || categoria_e_id){
            return res.status(400).json({message: 'los campos son obligatorios'});
        }

        const result = await pool.query(`INSERT INTO enfermedades (nombre, descripcion, categoria_e_id, estado) VALUES ($1, $2, $3, TRUE) RETURNING *`, 
            [nombre, descripcion, categoria_e_id]); 

            await registrarBitacora({
                accion: 'Registro',
                tabla: 'Enfermedades',
                usuario: req.user.username,
                usuarios_id: req.user.id,
                descripcion: `Se Registro la enfermedad con nombre: ${nombre}`,
                datos: {nuevos: result.rows[0]}
            });

            return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al registrar la enfermedad', error);
        next();
    }
};

const updateEnfermedad = async (req, res, next) => {
    const { id } = req.params;

    try {
        const {nombre, descripcion, categoria_e_id, estado} = req.body;

        const oldEnfermedad = await pool.query('SELECT * FROM enfermedades WHERE id = $1', [id]);

        const result = await pool.query(`UPDATE enfermedades SET nombre = $1, descripcion = $2, categoria_e_id = $3, estado = $4 WHERE id = $5s RETURNING`, 
            [nombre, descripcion, categoria_e_id, estado, id]);
            
            await registrarBitacora({
                accion: 'Actualizo',
                tabla: 'Enfermedades',
                usuario: req.user.username,
                usuarios_id: req.user.id,
                descripcion: `Se Actualizo la enfermedad con id ${id}`,
                datos: { antiguos:oldEnfermedad.rows[0], nuevos: result.rows[0]}
            });

            return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(`Error al actualizar la enfermedad con id: ${id}` ,error);
        next();
    }
};

const deleteEnfermedad = async (req, res, next) => {
    const { id } = req.params;

    try {
        const oldEnfermedad = pool.query('SELECT * FROM enfermedades WHERE id = $1', [id]);

        const result = await pool.query('DELETE FROM enfermedades WHERE id = $1', [id]);
        
        if(result.rowCount === 0){
            return res.status(404).json({
                message: 'Error en la solicitud, no puede encontrarse o no existe'
            });
        }

        await registrarBitacora({
            accion: 'Elimino',
            tabla: 'Enfermedades',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Elimino la enfermedad ${oldEnfermedad.rows[0]?.nombre}`,
            datos: {antiguos: oldEnfermedad.rows[0]}
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error('Error al eliminar la enfermedad', error);
        next();
    }
};

const getCategoria_e = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, nombre FROM enfermedades ORDER BY nombre ASC');
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('error al obtener todas las categorias de enfermedades', error);
        next();
    }
};

module.exports ={
    getAllEnfermedades,
    getEnfermedades,
    createEnfermedad,
    updateEnfermedad,
    deleteEnfermedad,
    getCategoria_e
};