const pool = require('../config/db');

const getEpidemiologicoData = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        let query = `
            SELECT 
                e.nombre, 
                COUNT(*) as cantidad
            FROM consultas c
            JOIN enfermedades e ON c.enfermedades_id = e.id
            WHERE c.estatus = 'Realizada'
        `;
        const params = [];
        if (start && end) {
            query += ` AND c.fecha_atencion BETWEEN $1 AND $2`;
            params.push(start, end);
        }
        query += ` GROUP BY e.nombre ORDER BY cantidad DESC`;

        const result = await pool.query(query, params);
        const totalConsultas = result.rows.reduce((acc, curr) => acc + parseInt(curr.cantidad), 0);

        return res.json({
            patologias: result.rows,
            totalConsultas,
            periodo: start && end ? `${start} al ${end}` : 'Histórico General'
        });
    } catch (error) {
        console.error('Error en getEpidemiologicoData:', error);
        next(error);
    }
};

const getAusentismoData = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        let query = `
            SELECT 
                d.nombre, 
                COUNT(DISTINCT r.pacientes_id) as cantidad_pacientes, 
                SUM(r.fecha_fin - r.fecha_inicio + 1) as total_dias
            FROM reposos r
            JOIN pacientes p ON r.pacientes_id = p.id
            JOIN departamentos d ON p.departamentos_id = d.id
        `;
        const params = [];
        if (start && end) {
            query += ` WHERE r.fecha_inicio >= $1 AND r.fecha_fin <= $2`;
            params.push(start, end);
        }
        query += ` GROUP BY d.nombre`;

        const result = await pool.query(query, params);
        const totalDiasGlobal = result.rows.reduce((acc, curr) => acc + parseInt(curr.total_dias || 0), 0);

        return res.json({
            departamentos: result.rows.map(r => ({
                ...r,
                total_dias: parseInt(r.total_dias || 0),
                cantidad_pacientes: parseInt(r.cantidad_pacientes || 0)
            })),
            totalDiasGlobal,
            periodo: start && end ? `${start} al ${end}` : 'Todo'
        });
    } catch (error) {
        console.error('Error en getAusentismoData:', error);
        next(error);
    }
};

const getProductividadData = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        let query = `
            SELECT 
                dr.nombre, 
                dr.apellido, 
                COUNT(c.id) as total_programadas,
                COUNT(c.id) FILTER (WHERE c.estatus = 'realizada') as total_realizadas,
                COUNT(c.id) FILTER (WHERE c.estatus = 'cancelada') as total_canceladas
            FROM citas c
            JOIN doctor dr ON c.doctor_id = dr.id
        `;
        const params = [];
        if (start && end) {
            query += ` WHERE c.fecha_cita BETWEEN $1 AND $2`;
            params.push(start, end);
        }
        query += ` GROUP BY dr.id, dr.nombre, dr.apellido`;

        const result = await pool.query(query, params);

        return res.json({
            doctores: result.rows.map(r => ({
                ...r,
                total_programadas: parseInt(r.total_programadas),
                total_realizadas: parseInt(r.total_realizadas),
                total_canceladas: parseInt(r.total_canceladas)
            })),
            periodo: start && end ? `${start} al ${end}` : 'Histórico'
        });
    } catch (error) {
        console.error('Error en getProductividadData:', error);
        next(error);
    }
};

module.exports = {
    getEpidemiologicoData,
    getAusentismoData,
    getProductividadData
};
