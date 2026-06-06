const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/articulos — listar todos (con info de categoría)
    router.get('/', (req, res) => {
        const { categoria_id, activo } = req.query;
        let query = `
            SELECT a.*, c.nombre AS categoria_nombre
            FROM articulos a
            LEFT JOIN categorias c ON a.categoria_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (categoria_id) {
            query += ' AND a.categoria_id = ?';
            params.push(categoria_id);
        }
        if (activo !== undefined) {
            query += ' AND a.activo = ?';
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }
        query += ' ORDER BY a.nombre';

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // GET /api/articulos/:id — obtener uno
    router.get('/:id', (req, res) => {
        db.get(
            `SELECT a.*, c.nombre AS categoria_nombre
             FROM articulos a
             LEFT JOIN categorias c ON a.categoria_id = c.id
             WHERE a.id = ?`,
            [req.params.id],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row) return res.status(404).json({ error: 'Artículo no encontrado' });
                res.json(row);
            }
        );
    });

    // GET /api/articulos/:id/disponibilidad?fecha_inicio=&fecha_fin=
    // Devuelve cuántas unidades están disponibles en ese rango de fechas
    router.get('/:id/disponibilidad', (req, res) => {
        const { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
        }

        db.get('SELECT stock_total FROM articulos WHERE id = ?', [req.params.id], (err, articulo) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });

            // Suma las unidades ocupadas en alquileres activos/pendientes que se superponen
            db.get(
                `SELECT COALESCE(SUM(ai.cantidad), 0) AS ocupadas
                 FROM alquiler_items ai
                 JOIN alquileres al ON ai.alquiler_id = al.id
                 WHERE ai.articulo_id = ?
                   AND al.estado NOT IN ('cancelado', 'devuelto')
                   AND al.fecha_inicio <= ?
                   AND al.fecha_fin   >= ?`,
                [req.params.id, fecha_fin, fecha_inicio],
                (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    const disponibles = articulo.stock_total - row.ocupadas;
                    res.json({
                        articulo_id: parseInt(req.params.id),
                        stock_total: articulo.stock_total,
                        ocupadas: row.ocupadas,
                        disponibles: disponibles > 0 ? disponibles : 0,
                    });
                }
            );
        });
    });

    // POST /api/articulos — crear
    router.post('/', (req, res) => {
        const { nombre, descripcion, precio_por_dia, stock_total, categoria_id } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
        if (precio_por_dia === undefined || precio_por_dia < 0) {
            return res.status(400).json({ error: 'El precio por día es obligatorio y debe ser >= 0' });
        }
        if (!stock_total || stock_total < 1) {
            return res.status(400).json({ error: 'El stock debe ser al menos 1' });
        }

        db.run(
            `INSERT INTO articulos (nombre, descripcion, precio_por_dia, stock_total, categoria_id)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, descripcion || null, precio_por_dia, stock_total, categoria_id || null],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                db.get(
                    `SELECT a.*, c.nombre AS categoria_nombre
                     FROM articulos a LEFT JOIN categorias c ON a.categoria_id = c.id
                     WHERE a.id = ?`,
                    [this.lastID],
                    (err, row) => res.status(201).json(row)
                );
            }
        );
    });

    // PUT /api/articulos/:id — actualizar
    router.put('/:id', (req, res) => {
        const { nombre, descripcion, precio_por_dia, stock_total, categoria_id, activo } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

        db.run(
            `UPDATE articulos
             SET nombre = ?, descripcion = ?, precio_por_dia = ?,
                 stock_total = ?, categoria_id = ?, activo = ?
             WHERE id = ?`,
            [
                nombre,
                descripcion || null,
                precio_por_dia,
                stock_total,
                categoria_id || null,
                activo !== undefined ? (activo ? 1 : 0) : 1,
                req.params.id,
            ],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Artículo no encontrado' });
                db.get(
                    `SELECT a.*, c.nombre AS categoria_nombre
                     FROM articulos a LEFT JOIN categorias c ON a.categoria_id = c.id
                     WHERE a.id = ?`,
                    [req.params.id],
                    (err, row) => res.json(row)
                );
            }
        );
    });

    // DELETE /api/articulos/:id — eliminar (solo si no tiene alquileres activos)
    router.delete('/:id', (req, res) => {
        db.get(
            `SELECT COUNT(*) as total FROM alquiler_items ai
             JOIN alquileres al ON ai.alquiler_id = al.id
             WHERE ai.articulo_id = ? AND al.estado IN ('pendiente','activo')`,
            [req.params.id],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (row.total > 0) {
                    return res.status(409).json({
                        error: 'No se puede eliminar: el artículo tiene alquileres activos o pendientes',
                    });
                }
                db.run('DELETE FROM articulos WHERE id = ?', [req.params.id], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    if (this.changes === 0) return res.status(404).json({ error: 'Artículo no encontrado' });
                    res.json({ message: 'Artículo eliminado correctamente' });
                });
            }
        );
    });

    return router;
};
