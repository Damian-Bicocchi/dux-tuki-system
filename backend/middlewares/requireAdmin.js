/**
 * Middleware que sólo deja pasar a usuarios administradores (is_admin = 1).
 * Se usa para acciones que ningún rol dinámico puede obtener por permiso,
 * como crear, editar o eliminar roles.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autorizado: usuario no identificado.' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      message: 'Acceso denegado: esta acción está reservada a administradores.',
    });
  }

  return next();
};

module.exports = requireAdmin;
