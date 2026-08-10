const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // 1. IMPORTAR JWT
const { getDb } = require('../db');
const authenticate = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();


// Clave secreta para firmar tokens (debería estar en tu archivo .env)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';

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

// POST /api/usuarios/register — registro de usuario
router.post('/register', authenticate, (req, res) => {
    const { username, password, role_id, is_admin } = req.body;
    const db = getDb();

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: 'Los campos son obligatorios' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run(
            'INSERT INTO usuarios (username, password, role_id, is_admin) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role_id || null, is_admin ? 1 : 0],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res
                            .status(409)
                            .json({ error: 'El username ya existe' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ 
                    id: this.lastID, 
                    username, 
                    message: 'Usuario registrado con éxito' 
                });
            },
        );
    });
});

// PUT /api/usuarios/:id/rol — Asignar o modificar el rol de un usuario
router.put(
    '/:id/rol',
    authenticate,
    checkPermission('users:assign_roles'), // Solo el admin o autorizado
    (req, res) => {
        const userId = req.params.id;
        const { role_id, is_admin } = req.body;
        const db = getDb();

        db.run(
            `UPDATE usuarios 
             SET role_id = ?, is_admin = ? 
             WHERE id = ?`,
            [role_id || null, is_admin ? 1 : 0, userId],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

                res.json({ message: 'Rol del usuario actualizado correctamente' });
            }
        );
    }
);

module.exports = router;