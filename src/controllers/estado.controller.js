const pool = require('../config/db');
const { registrarBitacora } = require('../helpers/registerBitacora');

const getAllEstado = async (req, res, next) => {
    try{
        const result =await pool.query('SELECT * FROM estado ORDER BY DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todos los estados', error);
        next();
    }
};

const getEstado = async (req, res, next) => {
    const { id } = req.params;
    try{
        const result = pool.query('SELECT * FROM estado WHERE id = $1', [id]);
        
        if(result.rows.length === 0){
            return res.status(404).json({
                messaje: '--> Error <-- Solicitud no se encuentra o es inexistente'
            });
        }
        return res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error de la Solicitud con id: ${id}`, error);
        next();
    }
};

const createEstado = async (req, res, next) => {
    const { id } = req.params;
    try{
        const { nombre } = req.body;

        
        const result = await pool.query('INSERT INTO estado (nombre) VALUES ($1) RETURNING *', [nombre]);
        
        await registrarBitacora({
            accion:'Registro',
            tabla:'Estado',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion:`Se Registro un estado con nombre: ${nombre}`,
            datos: {nuevos: result.rows[0]}
        });
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('', error);
        next();
    }    
};

const updateEstado = async (req, res, next) => {
    const { id } = req.params;

    try {
        const { nombre } = req.body;

        const oldEstado = await pool.query('SELECT * FROM estado WHERE id = $1', [id]);
        
        const result = await pool.query('UPDATE estado SET nombre = $1 WHERE id = $2', [nombre]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: ' --> Error <-- la Solictud no puede ser encontrada o es inexistente'
            });
        };
        
        await registrarBitacora({
            accion:'Actualizo',
            tabla: 'Estado',
            usuario: req.user.username,
            usuarios_id: req.user.id,
            descripcion: `Se Actualizo el estado con nombre ${nombre}`,
            datos: {antiguos: oldEstado.rows[0], nuevos: result.rows[0]}
        });
        
        return res.json(result.rows[0]); 
    } catch (error) {
        console.error(`Error al actualizar el estado con id ${id}`);
        next();
    }
};

const deleteEstado = async (req, res, next) => {
    const { id } = req.params;

    try {  
        const oldEstado = await pool.query('SELECT * FROM estado WHERE id = $1', [id]);

        const result = await pool.query('DELETE * FROM estado WHERE id = $1', [id]);

        if (result.RowCount === 0) {
            return res.status(404).json({
                message: 'Error Solicitud no se encuentra o es inexistente'
            });
        };

        await registrarBitacora({
            accion: 'Elimino',
            tabla: 'Estado',
            usuario: req.user.username,
            usario_id: req.user.id,
            descripcion: `Se Elimino Estado: ${oldEstado.rows[0]?.nombre || id}`,
            datos: { antiguos: oldEstado.rows[0]}
        });
    } catch (error) {
        console.error(`Error al Eliminar el Estado con id: ${id}`, error);
        next();s
    }
};

module.exports = {
    getAllEstado,
    getEstado,
    createEstado,
    updateEstado,
    deleteEstado
};