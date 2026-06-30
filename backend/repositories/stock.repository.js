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

  create({
    nombre,
    stock_total,
    categoria_id,
    precio_por_dia,
    deposito_garantia,
  }) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO articulos (
          nombre,
          stock_total,
          categoria_id,
          precio_por_dia,
          deposito_garantia,
          activo
        )
        VALUES (?, ?, ?, ?, ?, 1)
      `;

      getDb().run(
        query,
        [
          nombre,
          stock_total,
          categoria_id,
          precio_por_dia,
          deposito_garantia,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              nombre,
              stock_total,
              categoria_id,
              precio_por_dia,
              deposito_garantia,
              activo: 1,
            });
          }
        }
      );
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

  findArticuloById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT a.*, c.nombre AS categoria_nombre
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.id = ?
    `;

    getDb().get(query, [id], (err, row) => {
      if (err) {
        return reject(err); // El error de base de datos se propaga hacia arriba
      }
      resolve(row); // Retorna la fila (o undefined si no existe)
    });
  });
};
}

module.exports = new StockRepository();