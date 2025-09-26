const cron = require('node-cron');
const pool = require('./db'); 


cron.schedule('*/05 * * * *', async () => {
    try {
        // Limpia sesiones expiradas (fecha_fin < NOW() o activo = false)
        const result = await pool.query(`
            UPDATE sesiones SET activo = false WHERE fecha_fin IS NOT NULL AND fecha_fin < NOW()
        `);
        console.log(`[${new Date().toISOString()}] Sesiones expiradas eliminadas: ${result.rowCount}`);
    } catch (err) {
        console.error('Error limpiando sesiones huérfanas:', err);
    }
});