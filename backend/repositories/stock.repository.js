const { getDb } = require('../db');

class StockRepository {
  findAll() {
    return new Promise((resolve, reject) => {
      // Hacemos LEFT JOIN con categorías para tener el nombre listo en el Frontend
      const query = `
        SELECT
          a.*,
          c.nombre AS categoria_nombre,
          COALESCE(SUM(
            CASE
              WHEN al.estado NOT IN ('cancelado')
                THEN CASE
                  WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                    THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                  ELSE 0
                END
              ELSE 0
            END
          ), 0) AS cantidad_alquilados
        FROM articulos a
        LEFT JOIN categorias c ON a.categoria_id = c.id
        LEFT JOIN alquiler_items ai ON a.id = ai.articulo_id
        LEFT JOIN alquileres al ON ai.alquiler_id = al.id
        LEFT JOIN (
          SELECT ac.alquiler_id, ci.alquiler_item_id, SUM(ci.cantidad_devuelta) AS cantidad_devuelta
          FROM alquiler_cierres ac
          JOIN alquiler_cierre_items ci ON ci.cierre_id = ac.id
          GROUP BY ac.alquiler_id, ci.alquiler_item_id
        ) ciu ON ciu.alquiler_id = al.id AND ciu.alquiler_item_id = ai.id
        WHERE a.activo = 1
        GROUP BY a.id
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
      SELECT
        a.*,
        c.nombre AS categoria_nombre,
        COALESCE(SUM(
          CASE
            WHEN al.estado NOT IN ('cancelado')
              THEN CASE
                WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                  THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                ELSE 0
              END
            ELSE 0
          END
        ), 0) AS cantidad_alquilados
      FROM articulos a
      LEFT JOIN categorias c ON a.categoria_id = c.id
      LEFT JOIN alquiler_items ai ON a.id = ai.articulo_id
      LEFT JOIN alquileres al ON ai.alquiler_id = al.id
      LEFT JOIN (
        SELECT ac.alquiler_id, ci.alquiler_item_id, SUM(ci.cantidad_devuelta) AS cantidad_devuelta
        FROM alquiler_cierres ac
        JOIN alquiler_cierre_items ci ON ci.cierre_id = ac.id
        GROUP BY ac.alquiler_id, ci.alquiler_item_id
      ) ciu ON ciu.alquiler_id = al.id AND ciu.alquiler_item_id = ai.id
      WHERE a.id = ?
      GROUP BY a.id
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