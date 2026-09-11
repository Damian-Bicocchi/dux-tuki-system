const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // 1. IMPORTAR JWT
const { getDb } = require('../db');
const authenticate = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');
const { JWT_SECRET } = require('../config/env');

const router = express.Router();

const SELECT_USUARIO_CON_ROL = `
    SELECT u.id, u.username, u.is_admin, u.role_id, u.created_at,
           r.nombre AS role_name
    FROM usuarios u
    LEFT JOIN roles r ON u.role_id = r.id
`;

function mapUsuarioRow(row) {
    return {
        id: row.id,
        username: row.username,
        is_admin: Boolean(row.is_admin),
        role_id: row.role_id,
        role_name: row.role_name || null,
        created_at: row.created_at,
    };
}

/**
 * Resuelve y valida la combinación rol/administrador antes de guardarla.
 * Un usuario administrador no tiene rol asignado: `is_admin` manda sobre `role_id`.
 */
function resolveAsignacionRol(db, { role_id, is_admin }) {
    if (Boolean(is_admin)) {
        return Promise.resolve({ role_id: null, is_admin: 1 });
    }

    if (role_id === undefined || role_id === null || role_id === '') {
        return Promise.resolve({ role_id: null, is_admin: 0 });
    }

    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM roles WHERE id = ?', [role_id], (err, row) => {
            if (err) return reject(err);
            if (!row) {
                const error = new Error('El rol seleccionado no existe');
                error.status = 400;
                return reject(error);
            }
            resolve({ role_id: Number(role_id), is_admin: 0 });
        });
    });
}

// POST /api/usuarios/login — login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: 'Correo y contraseña son obligatorios' });
    }

    // Consulta corregida con las columnas reales de la tabla roles: r.nombre y r.permisos
    const sql = `
        SELECT u.id, u.username, u.password, u.is_admin,
               r.id AS role_id, r.nombre AS role_name, r.permisos AS role_permissions
        FROM usuarios u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username = ?
    `;

    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error("Error en la consulta SQL de login:", err.message); // Muestra el error exacto en consola
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        bcrypt.compare(password, row.password, (err, match) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

            // Parsear el array de permisos desde JSON string
            let parsedPermissions = [];
            if (row.role_permissions) {
                try {
                    parsedPermissions = typeof row.role_permissions === 'string'
                        ? JSON.parse(row.role_permissions)
                        : row.role_permissions;
                } catch (e) {
                    parsedPermissions = [];
                }
            }

            // Construir el payload del token JWT
            const payload = {
                id: row.id,
                username: row.username,
                isAdmin: Boolean(row.is_admin),
                role: row.role_name ? {
                    id: row.role_id,
                    name: row.role_name,
                    permissions: parsedPermissions
                } : null
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

            res.json({
                message: 'Login exitoso',
                token,
                user: {
                    id: row.id,
                    username: row.username,
                    isAdmin: Boolean(row.is_admin),
                    role: payload.role
                }
            });
        });
    });
});

// GET /api/usuarios — listar usuarios con su rol (sólo administradores)
router.get('/', authenticate, requireAdmin, (req, res) => {
    const db = getDb();
    db.all(`${SELECT_USUARIO_CON_ROL} ORDER BY u.username COLLATE NOCASE`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(mapUsuarioRow));
    });
});

// POST /api/usuarios/register — registro de usuario (sólo administradores)
router.post('/register', authenticate, requireAdmin, (req, res) => {
    const { username, password, role_id, is_admin } = req.body;
    const db = getDb();

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: 'El correo y la contraseña son obligatorios' });
    }

    resolveAsignacionRol(db, { role_id, is_admin })
        .then(({ role_id: resolvedRoleId, is_admin: resolvedIsAdmin }) => {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return res.status(500).json({ error: err.message });

                db.run(
                    'INSERT INTO usuarios (username, password, role_id, is_admin) VALUES (?, ?, ?, ?)',
                    [username, hashedPassword, resolvedRoleId, resolvedIsAdmin],
                    function (err) {
                        if (err) {
                            if (err.message.includes('UNIQUE')) {
                                return res
                                    .status(409)
                                    .json({ error: 'Ya existe un usuario con ese correo' });
                            }
                            return res.status(500).json({ error: err.message });
                        }

                        db.get(
                            `${SELECT_USUARIO_CON_ROL} WHERE u.id = ?`,
                            [this.lastID],
                            (err, row) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.status(201).json(mapUsuarioRow(row));
                            }
                        );
                    },
                );
            });
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.message });
        });
});

// PUT /api/usuarios/:id/rol — Asignar o modificar el rol de un usuario
router.put(
    '/:id/rol',
    authenticate,
    requireAdmin, // Sólo administradores pueden asignar roles
    (req, res) => {
        const userId = req.params.id;
        const { role_id, is_admin } = req.body;
        const db = getDb();

        if (req.user && Number(req.user.id) === Number(userId)) {
            return res.status(400).json({
                error: 'No podés modificar tu propio rol de usuario. Pedile a otro administrador que lo haga.',
            });
        }

        resolveAsignacionRol(db, { role_id, is_admin })
            .then(({ role_id: resolvedRoleId, is_admin: resolvedIsAdmin }) => {
                db.run(
                    `UPDATE usuarios
                     SET role_id = ?, is_admin = ?
                     WHERE id = ?`,
                    [resolvedRoleId, resolvedIsAdmin, userId],
                    function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

                        db.get(
                            `${SELECT_USUARIO_CON_ROL} WHERE u.id = ?`,
                            [userId],
                            (err, row) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json(mapUsuarioRow(row));
                            }
                        );
                    }
                );
            })
            .catch((err) => {
                res.status(err.status || 500).json({ error: err.message });
            });
    }
);

module.exports = router;
