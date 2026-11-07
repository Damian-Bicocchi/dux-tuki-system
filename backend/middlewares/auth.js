const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const usuariosRepository = require('../repositories/usuarios.repository');

/**
 * Valida el JWT y reconstruye el usuario desde la base de datos.
 *
 * Los permisos y el rol NO se toman del token: se leen en cada petición para
 * que los cambios de rol/permisos se apliquen inmediatamente. Además se
 * compara `tokenVersion` con el de la base para invalidar tokens revocados
 * (por ejemplo, al cerrar sesión).
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message:
                    'Acceso denegado: Token de autenticación no proporcionado o formato inválido.',
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Acceso denegado: Token no encontrado.',
            });
        }

        const decodedPayload = jwt.verify(token, JWT_SECRET);
        const user = await usuariosRepository.findByIdWithRole(
            decodedPayload.id,
        );

        if (!user) {
            return res.status(401).json({
                message:
                    'No autorizado: el usuario asociado a este token ya no existe.',
            });
        }

        if (
            Number(decodedPayload.tokenVersion) !== Number(user.tokenVersion)
        ) {
            return res.status(401).json({
                message:
                    'La sesión fue revocada. Por favor, vuelve a iniciar sesión.',
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message:
                    'La sesión ha expirado. Por favor, vuelve a iniciar sesión.',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                message: 'Token de autenticación inválido o alterado.',
            });
        }

        return res.status(500).json({
            message:
                'Error interno en el servidor durante la autenticación.',
            error: error.message,
        });
    }
};

module.exports = authenticate;
