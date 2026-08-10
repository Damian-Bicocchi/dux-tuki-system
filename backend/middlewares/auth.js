const jwt = require('jsonwebtoken');

// OPCIONAL: Si prefieres consultar la base de datos en cada petición para reflejar 
// cambios de permisos en tiempo real, puedes importar tu modelo/repositorio de usuarios aquí:
// const userRepository = require('../repositories/userRepository');

/**
 * Middleware para validar la autenticación basada en JSON Web Tokens (JWT).
 * Extrae el token del header "Authorization: Bearer <token>", lo verifica
 * y adjunta la información del usuario a `req.user`.
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Obtener el header 'Authorization' de la petición
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // 2. Verificar que el header exista y tenga la estructura 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Acceso denegado: Token de autenticación no proporcionado o formato inválido.'
      });
    }

    // 3. Extraer solo la cadena del token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Acceso denegado: Token no encontrado.'
      });
    }

    // 4. Verificar la firma y validez del token
    const secretKey = process.env.JWT_SECRET || 'tu_clave_secreta_por_defecto';
    const decodedPayload = jwt.verify(token, secretKey);

    // =========================================================================
    // ESTRATEGIA DE CARGA DEL USUARIO (Elige la que mejor se adapte a tu proyecto)
    // =========================================================================

    // OPCIÓN A: Usar la información almacenada dentro del propio JWT.
    // El payload descifrado debe contener el ID, isAdmin y los datos de rol/permisos.
    req.user = decodedPayload;

    /*
    // OPCIÓN B (Recomendada para permisos dinámicos en tiempo real):
    // Consultar la base de datos usando el ID codificado en el token.
    // Esto garantiza que si el Admin modifica el rol o permisos en este instante,
    // el cambio se aplique de inmediato sin exigir que el usuario vuelva a loguearse.

    const userInDb = await userRepository.findByIdWithRole(decodedPayload.id);
    
    if (!userInDb) {
      return res.status(401).json({ 
        message: 'No autorizado: El usuario asociado a este token ya no existe.' 
      });
    }

    req.user = userInDb;
    */

    // 5. Continuar con la ejecución de la ruta o el siguiente middleware (checkPermission)
    return next();

  } catch (error) {
    // Manejo de errores específicos de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'La sesión ha expirado. Por favor, vuelve a iniciar sesión.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        message: 'Token de autenticación inválido o alterado.'
      });
    }

    return res.status(500).json({
      message: 'Error interno en el servidor durante la autenticación.',
      error: error.message
    });
  }
};

module.exports = authenticate;