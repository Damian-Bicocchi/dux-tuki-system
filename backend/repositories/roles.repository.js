const { getDb } = require('../db');

/**
 * Convierte la fila cruda de SQLite (permisos como JSON string) a un objeto de dominio.
 */
function mapRow(row) {
  if (!row) return row;
  let permisos = [];
  try {
    permisos = JSON.parse(row.permisos || '[]');
    if (!Array.isArray(permisos)) permisos = [];
  } catch (e) {
    permisos = [];
  }
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    permisos,
    created_at: row.created_at,
  };
}

class RolesRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      getDb().all('SELECT * FROM roles ORDER BY nombre COLLATE NOCASE', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(mapRow));
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      getDb().get('SELECT * FROM roles WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(mapRow(row));
      });
    });
  }

  findByName(nombre) {
    return new Promise((resolve, reject) => {
      getDb().get(
        'SELECT * FROM roles WHERE nombre = ? COLLATE NOCASE',
        [nombre],
        (err, row) => {
          if (err) reject(err);
          else resolve(mapRow(row));
        }
      );
    });
  }

  create(nombre, descripcion, permisos) {
    return new Promise((resolve, reject) => {
      getDb().run(
        'INSERT INTO roles (nombre, descripcion, permisos) VALUES (?, ?, ?)',
        [nombre, descripcion || null, JSON.stringify(permisos)],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  update(id, nombre, descripcion, permisos) {
    return new Promise((resolve, reject) => {
      getDb().run(
        'UPDATE roles SET nombre = ?, descripcion = ?, permisos = ? WHERE id = ?',
        [nombre, descripcion || null, JSON.stringify(permisos), id],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      getDb().run('DELETE FROM roles WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  countUsuarios(roleId) {
    return new Promise((resolve, reject) => {
      getDb().get(
        'SELECT COUNT(*) AS total FROM usuarios WHERE role_id = ?',
        [roleId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? row.total : 0);
        }
      );
    });
  }
}

module.exports = new RolesRepository();
