/**
 * Middleware para validar si el usuario tiene un permiso específico.
 * @param {string} requiredPermission - Clave del permiso (ej: 'permiso_para_crear_stock')
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;

    // 1. Si no hay usuario autenticado en la request
    if (!user) {
      return res.status(401).json({ 
        message: 'No autorizado: usuario no identificado.' 
      });
    }

    // 2. REGLA DE ORO: Si es Administrador, tiene acceso total directo
    if (user.isAdmin) {
      return next();
    }

    // 3. Obtener el arreglo de permisos que tiene asignados el usuario a través de su rol
    // (Asumiendo que req.user.role trae un objeto con { id, name, permissions: [...] })
    const userPermissions = user.role?.permissions || [];

    // 4. Verificar si el permiso requerido está presente en la lista de su rol
    if (userPermissions.includes(requiredPermission)) {
      return next();
    }

    // 5. Si no cumple con ninguna de las condiciones anteriores, denegar acceso
    return res.status(403).json({ 
      message: `Acceso denegado: no posees el permiso '${requiredPermission}' para realizar esta acción.` 
    });
  };
};

module.exports = checkPermission;