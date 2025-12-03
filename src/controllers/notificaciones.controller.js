const pool = require('../config/db');

// Obtener notificaciones de un usuario
const getNotificaciones = async (req, res, next) => {
  try {
    const usuario_id = req.user.id;
    const result = await pool.query(
      'SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY created_at DESC LIMIT 50',
      [usuario_id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    next(error);
  }
};

// Marcar una notificación como leída
const marcarLeida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    const result = await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2 RETURNING *',
      [id, usuario_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notificación no encontrada o no pertenece al usuario' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    next(error);
  }
};

// Marcar todas como leídas
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const usuario_id = req.user.id;
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1',
      [usuario_id]
    );
    return res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    next(error);
  }
};

// Crear una notificación (Función interna para usar desde otros controladores)
const crearNotificacionInterna = async (usuario_id, titulo, mensaje, tipo = 'info') => {
  try {
    await pool.query(
      'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES ($1, $2, $3, $4)',
      [usuario_id, titulo, mensaje, tipo]
    );
  } catch (error) {
    console.error('Error creando notificación interna:', error);
  }
};

module.exports = {
  getNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  crearNotificacionInterna
};