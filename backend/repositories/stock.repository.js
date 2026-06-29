const { getDb } = require('../db');

class StockRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      // Hacemos LEFT JOIN con categorías para tener el nombre listo en el Frontend
      const query = `
        SELECT a.*, c.nombre AS categoria_nombre 
        FROM articulos a
        LEFT JOIN categorias c ON a.categoria_id = c.id
        WHERE a.activo = 1
      `;
      getDb().all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  create({ nombre, stock_total, categoria_id }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO articulos (nombre, stock_total, categoria_id, precio_por_dia, activo) 
        VALUES (?, ?, ?, 0, 1)
      `;
      getDb().run(query, [nombre, stock_total, categoria_id], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            nombre,
            stock_total,
            categoria_id,
            precio_por_dia: 0,
            activo: 1
          });
        }
      });
    });
  }

  updateStock(id, stock_total) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE articulos 
        SET stock_total = ? 
        WHERE id = ?
      `;
      getDb().run(query, [stock_total, id], function (err) {
        if (err) reject(err);
        else resolve({ id, stock_total, changes: this.changes });
      });
    });
  }
}

module.exports = new StockRepository();