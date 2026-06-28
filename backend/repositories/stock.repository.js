const { getDb } = require('../db');

class StockRepository {
  getAll() {
    getDb().all(
        "SELECT COUNT(*) FROM articulos;",
        [],
        (err, rows) => console.log(rows)
    );
    return new Promise((resolve, reject) => {
      getDb().all(
        `
        SELECT
          a.id,
          a.nombre,
          c.nombre AS categoria,
          a.stock_total AS total,
          a.stock_total AS disponibles
        FROM articulos a
        LEFT JOIN categorias c ON a.categoria_id = c.id
        WHERE a.activo = 1
        `,
        [],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  findByNombreExacto(nombre) {
    return new Promise((resolve, reject) => {
      getDb().get(
        `
        SELECT
          a.id,
          a.nombre,
          c.nombre AS categoria,
          a.stock_total AS total,
          a.stock_total AS disponibles
        FROM articulos a
        LEFT JOIN categorias c ON a.categoria_id = c.id
        WHERE LOWER(TRIM(a.nombre)) = LOWER(TRIM(?))
          AND a.activo = 1
        `,
        [nombre],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  updateStock(nombre, cantidad) {
    return new Promise((resolve, reject) => {
      getDb().run(
        `
        UPDATE articulos
        SET stock_total = stock_total + ?
        WHERE nombre = ?
          AND activo = 1
        `,
        [cantidad, nombre],
        function (err) {
          if (err) return reject(err);

          if (this.changes === 0) {
            return resolve(null);
          }

          getDb().get(
            `
            SELECT
              a.id,
              a.nombre,
              c.nombre AS categoria,
              a.stock_total AS total,
              a.stock_total AS disponibles
            FROM articulos a
            LEFT JOIN categorias c ON a.categoria_id = c.id
            WHERE a.nombre = ?
            `,
            [nombre],
            (err, row) => {
              if (err) return reject(err);
              resolve(row);
            }
          );
        }
      );
    });
  }

  create(item) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get(
        `SELECT id FROM categorias WHERE nombre = ?`,
        [item.categoria],
        (err, categoria) => {
          if (err) return reject(err);

          const categoriaId = categoria ? categoria.id : null;

          db.run(
            `
            INSERT INTO articulos (
              nombre,
              categoria_id,
              stock_total,
              precio_por_dia
            )
            VALUES (?, ?, ?, 0)
            `,
            [item.nombre, categoriaId, item.total],
            function (err) {
              if (err) return reject(err);

              resolve({
                id: this.lastID,
                nombre: item.nombre,
                categoria: item.categoria,
                total: item.total,
                disponibles: item.total,
              });
            }
          );
        }
      );
    });
  }
}

module.exports = new StockRepository();