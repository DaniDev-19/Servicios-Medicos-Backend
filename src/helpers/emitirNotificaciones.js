const pool = require('../config/db');

async function guardarNotificaciones(datosNotificacion) {
    if (!datosNotificacion || !datosNotificacion.usuario_id) return null;
    const {usuario_id, mensaje } = datosNotificacion;
    const result = await pool.query(
        'INSERT INTO notificaciones (usuario_id, mensaje) VALUES ($1, $2) RETURNING*',
        [usuario_id, mensaje]
    );
}

async function crearYemitirNotificacion (req, usuarioId, datosNotificacion) {
    const usuario_id = usuarioId || (datosNotificacion && datosNotificacion.usuario_id);
    if (!usuario_id) return; 
    const notificacionGuardada = await guardarNotificaciones({ usuario_id, mensaje: datosNotificacion.mensaje });
    const io = req.app.get('io');
    if(io && usuario_id){
        io.to(`usuario_${usuario_id}`).emit('nueva_notificacion', notificacionGuardada);
    }
}

module.exports = { crearYemitirNotificacion };