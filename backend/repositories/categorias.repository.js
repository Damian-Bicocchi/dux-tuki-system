const { getDb } = require('../db');

class CategoriasRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      getDb().all('SELECT * FROM categorias ORDER BY nombre', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      getDb().get('SELECT * FROM categorias WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  create(nombre, descripcion) {
    return new Promise((resolve, reject) => {
      getDb().run(
        'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [nombre, descripcion || null],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, nombre, descripcion });
        }
      );
    });
  }

  update(id, nombre, descripcion) {
    return new Promise((resolve, reject) => {
      getDb().run(
        'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
        [nombre, descripcion || null, id],
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      getDb().run('DELETE FROM categorias WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
}

module.exports = new CategoriasRepository();