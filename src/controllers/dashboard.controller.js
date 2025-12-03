const pool = require('../config/db');

const getDashboardStats = async (req, res, next) => {
    try {
        
        const pacientesResult = await pool.query('SELECT COUNT(*) as total FROM pacientes');
        const totalPacientes = parseInt(pacientesResult.rows[0].total);

       
        const historiasResult = await pool.query('SELECT COUNT(*) as total FROM historias_medicas WHERE estado = true');
        const totalHistorias = parseInt(historiasResult.rows[0].total);

        
        const consultasResult = await pool.query("SELECT COUNT(*) as total FROM consultas WHERE estatus = 'Realizada'");
        const totalConsultas = parseInt(consultasResult.rows[0].total);

        
        const medicamentosResult = await pool.query('SELECT COUNT(*) as total FROM medicamentos WHERE estado = true');
        const totalMedicamentos = parseInt(medicamentosResult.rows[0].total);

       
        const consultasHoyResult = await pool.query(`
            SELECT COUNT(*) as total 
            FROM consultas 
            WHERE DATE(fecha_atencion) = CURRENT_DATE AND estatus = 'Realizada'
        `);
        const consultasHoy = parseInt(consultasHoyResult.rows[0].total);

    
        const consultasSemanaResult = await pool.query(`
            SELECT 
                TO_CHAR(fecha_atencion, 'Day') as dia,
                COUNT(*) as total
            FROM consultas
            WHERE fecha_atencion >= CURRENT_DATE - INTERVAL '7 days'
            AND estatus = 'Realizada'
            GROUP BY TO_CHAR(fecha_atencion, 'Day'), EXTRACT(DOW FROM fecha_atencion)
            ORDER BY EXTRACT(DOW FROM fecha_atencion)
        `);
        const consultasPorSemana = consultasSemanaResult.rows;

       
        const consultasMesResult = await pool.query(`
            SELECT COUNT(*) as total 
            FROM consultas 
            WHERE fecha_atencion >= CURRENT_DATE - INTERVAL '30 days'
            AND estatus = 'Realizada'
        `);
        const consultasMes = parseInt(consultasMesResult.rows[0].total);

        
        const actividadResult = await pool.query(`
            SELECT 
                b.accion,
                b.tabla,
                b.descripcion,
                b.fecha,
                b.usuario
            FROM bitacora b
            ORDER BY b.fecha DESC
            LIMIT 10
        `);
        const actividadReciente = actividadResult.rows;

        
        let proximasCitas = [];
        try {
           
            const citasResult = await pool.query(`
                SELECT 
                    c.id,
                    c.fecha_cita,
                    c.hora_cita,
                    c.motivo,
                    p.nombre || ' ' || p.apellido as paciente,
                    d.nombre || ' ' || d.apellido as doctor
                FROM citas c
                LEFT JOIN pacientes p ON c.pacientes_id = p.id
                LEFT JOIN doctor d ON c.doctor_id = d.id
                WHERE c.fecha_cita::DATE >= CURRENT_DATE
                AND LOWER(c.estatus) IN ('programada', 'confirmada')
                ORDER BY c.fecha_cita, c.hora_cita
                LIMIT 5
            `);
            proximasCitas = citasResult.rows;
        } catch (error) {
            console.log('Tabla citas no disponible o error en consulta:', error.message);
        }

       
        const enfermedadesResult = await pool.query(`
            SELECT 
                e.nombre as enfermedad,
                COUNT(*) as total
            FROM consultas c
            LEFT JOIN enfermedades e ON c.enfermedades_id = e.id
            WHERE c.estatus = 'Realizada' AND e.nombre IS NOT NULL
            GROUP BY e.nombre
            ORDER BY total DESC
            LIMIT 5
        `);
        const enfermedadesComunes = enfermedadesResult.rows;

       
        const medicamentosBajoStockResult = await pool.query(`
            SELECT 
                nombre,
                presentacion,
                cantidad_disponible
            FROM medicamentos
            WHERE cantidad_disponible < 10 AND estado = true
            ORDER BY cantidad_disponible ASC
            LIMIT 5
        `);
        const medicamentosBajoStock = medicamentosBajoStockResult.rows;

        
        const departamentosResult = await pool.query(`
            SELECT 
                d.nombre as departamento,
                COUNT(p.id) as total_pacientes
            FROM pacientes p
            LEFT JOIN departamentos d ON p.departamentos_id = d.id
            WHERE d.nombre IS NOT NULL
            GROUP BY d.nombre
            ORDER BY total_pacientes DESC
            LIMIT 5
        `);
        const departamentosTop = departamentosResult.rows;

        return res.json({
            estadisticas: {
                totalPacientes,
                totalHistorias,
                totalConsultas,
                totalMedicamentos,
                consultasHoy,
                consultasMes
            },
            consultasPorSemana,
            actividadReciente,
            proximasCitas,
            enfermedadesComunes,
            medicamentosBajoStock,
            departamentosTop
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        next(error);
    }
};

module.exports = {
    getDashboardStats
};
