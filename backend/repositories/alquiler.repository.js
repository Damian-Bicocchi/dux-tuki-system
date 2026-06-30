// repositories/alquiler.repository.js
const { getDb } = require('../db');

class AlquilerRepository {
  getStockTotalArticulo(articulo_id) {
    return new Promise((resolve, reject) => {
      getDb().get('SELECT stock_total, precio_por_dia FROM articulos WHERE id = ?', [articulo_id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  getCantidadOcupada(articulo_id, fecha_inicio, fecha_fin, excluir_alquiler_id = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT COALESCE(SUM(ai.cantidad), 0) AS ocupadas 
        FROM alquiler_items ai
        JOIN alquileres al ON ai.alquiler_id = al.id
        WHERE ai.articulo_id = ?
          AND al.estado NOT IN ('cancelado','devuelto')
          AND al.fecha_inicio <= ?
          AND al.fecha_fin   >= ?
      `;
      const params = [articulo_id, fecha_fin, fecha_inicio];

      if (excluir_alquiler_id) {
        query += ' AND al.id != ?';
        params.push(excluir_alquiler_id);
      }

      getDb().get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(row ? row.ocupadas : 0);
      });
    });
  }

  getAlquilerBase(id) {
    return new Promise((resolve, reject) => {
      getDb().get(
        `SELECT al.*, c.nombre AS cliente_nombre, c.email AS cliente_email, c.telefono AS cliente_telefono
         FROM alquileres al
         JOIN clientes c ON al.cliente_id = c.id
         WHERE al.id = ?`,
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row);
        }
      );
    });
  }

  getItemsDelAlquiler(id) {
    return new Promise((resolve, reject) => {
      getDb().all(
        `SELECT ai.*, a.nombre AS articulo_nombre, a.precio_por_dia AS precio_articulo_actual
         FROM alquiler_items ai
         JOIN articulos a ON ai.articulo_id = a.id
         WHERE ai.alquiler_id = ?`,
        [id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }

  listarAlquileresFiltrados({ estado, cliente_id, fecha_inicio, fecha_fin }) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT al.*, c.nombre AS cliente_nombre
        FROM alquileres al
        JOIN clientes c ON al.cliente_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (estado)       { query += ' AND al.estado = ?';       params.push(estado); }
      if (cliente_id)   { query += ' AND al.cliente_id = ?';   params.push(cliente_id); }
      if (fecha_inicio) { query += ' AND al.fecha_fin >= ?';   params.push(fecha_inicio); }
      if (fecha_fin)    { query += ' AND al.fecha_inicio <= ?'; params.push(fecha_fin); }

      query += ' ORDER BY al.fecha_inicio DESC';

      getDb().all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  insertarAlquiler({ cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas }) {
    return new Promise((resolve, reject) => {
      getDb().run(
        `INSERT INTO alquileres (cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cliente_id, fecha_inicio, fecha_fin, estado || 'pendiente', precio_total, notas || null],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  insertarItemsAlquiler(alquiler_id, items) {
    return new Promise((resolve, reject) => {
      const stmt = getDb().prepare(
        'INSERT INTO alquiler_items (alquiler_id, articulo_id, cantidad, precio_unitario_dia) VALUES (?, ?, ?, ?)'
      );
      for (const item of items) {
        stmt.run([alquiler_id, item.articulo_id, item.cantidad, item.precio_unitario_dia]);
      }
      stmt.finalize((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  actualizarAlquiler(alquiler_id, { cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas }) {
    return new Promise((resolve, reject) => {
      getDb().run(
        `UPDATE alquileres
         SET cliente_id = ?, fecha_inicio = ?, fecha_fin = ?,
             estado = ?, precio_total = ?, notas = ?
         WHERE id = ?`,
        [cliente_id, fecha_inicio, fecha_fin, estado || 'pendiente', precio_total, notas || null, alquiler_id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  borrarItemsAlquiler(alquiler_id) {
    return new Promise((resolve, reject) => {
      getDb().run('DELETE FROM alquiler_items WHERE alquiler_id = ?', [alquiler_id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  actualizarEstadoAlquiler(id, estado) {
    return new Promise((resolve, reject) => {
      getDb().run('UPDATE alquileres SET estado = ? WHERE id = ?', [estado, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

  eliminarAlquiler(id) {
    return new Promise((resolve, reject) => {
      getDb().run('DELETE FROM alquileres WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }
  
  // Nuevo método requerido para buscar alquileres asociados a un item en StockDetallePage.tsx
  findAlquileresByArticuloId(articuloId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT al.id, c.nombre AS cliente, al.estado, al.fecha_inicio, al.fecha_fin, al.precio_total AS precio
        FROM alquileres al
        JOIN clientes c ON al.cliente_id = c.id
        JOIN alquiler_items ai ON al.id = ai.alquiler_id
        WHERE ai.articulo_id = ?
        ORDER BY al.fecha_fin DESC
      `;
      getDb().all(query, [articuloId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
}

module.exports = new AlquilerRepository();