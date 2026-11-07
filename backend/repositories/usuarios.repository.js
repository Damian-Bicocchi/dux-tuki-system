const { getDb } = require('../db');

function parsePermissions(raw) {
    if (!raw) return [];

    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function mapUser(row) {
    if (!row) return null;

    return {
        id: row.id,
        username: row.username,
        isAdmin: Boolean(row.is_admin),
        tokenVersion: Number(row.token_version || 0),
        role: row.role_name
            ? {
                  id: row.role_id,
                  name: row.role_name,
                  permissions: parsePermissions(row.role_permissions),
              }
            : null,
    };
}

class UsuariosRepository {
    findByIdWithRole(id) {
        return new Promise((resolve, reject) => {
            getDb().get(
                `SELECT u.id, u.username, u.is_admin, u.token_version,
                        r.id AS role_id, r.nombre AS role_name,
                        r.permisos AS role_permissions
                 FROM usuarios u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
                [id],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(mapUser(row));
                },
            );
        });
    }

    incrementTokenVersion(id) {
        return new Promise((resolve, reject) => {
            getDb().run(
                `UPDATE usuarios
                 SET token_version = COALESCE(token_version, 0) + 1
                 WHERE id = ?`,
                [id],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                },
            );
        });
    }
}

module.exports = new UsuariosRepository();
