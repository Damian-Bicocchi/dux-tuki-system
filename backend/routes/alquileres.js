const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // ── Helpers ────────────────────────────────────────────────────────────────

    // Calcula la diferencia en días entre dos fechas (mínimo 1)
    function calcularDias(fecha_inicio, fecha_fin) {
        const inicio = new Date(fecha_inicio);
        const fin    = new Date(fecha_fin);
        const diff   = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        return diff < 1 ? 1 : diff;
    }

    // Verifica disponibilidad de un artículo para un rango, excluyendo un alquiler_id (para ediciones)
    function verificarDisponibilidad(articulo_id, cantidad, fecha_inicio, fecha_fin, excluir_alquiler_id = null) {
        return new Promise((resolve, reject) => {
            db.get('SELECT stock_total FROM articulos WHERE id = ?', [articulo_id], (err, articulo) => {
                if (err) return reject(err);
                if (!articulo) return reject(new Error(`Artículo ${articulo_id} no encontrado`));

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

                db.get(query, params, (err, row) => {
                    if (err) return reject(err);
                    const disponibles = articulo.stock_total - row.ocupadas;
                    if (disponibles < cantidad) {
                        reject(new Error(
                            `Stock insuficiente para artículo ${articulo_id}: ` +
                            `disponibles ${disponibles}, solicitados ${cantidad}`
                        ));
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    }

    // Obtiene un alquiler completo (con cliente e items)
    function getAlquilerCompleto(id, callback) {
        db.get(
            `SELECT al.*, c.nombre AS cliente_nombre, c.email AS cliente_email, c.telefono AS cliente_telefono
             FROM alquileres al
             JOIN clientes c ON al.cliente_id = c.id
             WHERE al.id = ?`,
            [id],
            (err, alquiler) => {
                if (err) return callback(err);
                if (!alquiler) return callback(null, null);

                db.all(
                    `SELECT ai.*, a.nombre AS articulo_nombre, a.precio_por_dia AS precio_articulo_actual
                     FROM alquiler_items ai
                     JOIN articulos a ON ai.articulo_id = a.id
                     WHERE ai.alquiler_id = ?`,
                    [id],
                    (err, items) => {
                        if (err) return callback(err);
                        callback(null, { ...alquiler, items });
                    }
                );
            }
        );
    }

    // ── GET /api/alquileres — listar todos ─────────────────────────────────────
    router.get('/', (req, res) => {
        const { estado, cliente_id, fecha_inicio, fecha_fin } = req.query;

        let query = `
            SELECT al.*, c.nombre AS cliente_nombre
            FROM alquileres al
            JOIN clientes c ON al.cliente_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (estado)      { query += ' AND al.estado = ?';            params.push(estado); }
        if (cliente_id)  { query += ' AND al.cliente_id = ?';        params.push(cliente_id); }
        if (fecha_inicio){ query += ' AND al.fecha_fin >= ?';         params.push(fecha_inicio); }
        if (fecha_fin)   { query += ' AND al.fecha_inicio <= ?';      params.push(fecha_fin); }

        query += ' ORDER BY al.fecha_inicio DESC';

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // ── GET /api/alquileres/:id — obtener uno completo ─────────────────────────
    router.get('/:id', (req, res) => {
        getAlquilerCompleto(req.params.id, (err, alquiler) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!alquiler) return res.status(404).json({ error: 'Alquiler no encontrado' });
            res.json(alquiler);
        });
    });

    // ── POST /api/alquileres — crear ───────────────────────────────────────────
    // Body esperado:
    // {
    //   cliente_id, fecha_inicio, fecha_fin, estado?, notas?,
    //   items: [{ articulo_id, cantidad, precio_unitario_dia? }]
    // }
    router.post('/', async (req, res) => {
        const { cliente_id, fecha_inicio, fecha_fin, estado, notas, items } = req.body;

        // Validaciones básicas
        if (!cliente_id)   return res.status(400).json({ error: 'cliente_id es obligatorio' });
        if (!fecha_inicio) return res.status(400).json({ error: 'fecha_inicio es obligatoria' });
        if (!fecha_fin)    return res.status(400).json({ error: 'fecha_fin es obligatoria' });
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Se requiere al menos un artículo en items' });
        }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            return res.status(400).json({ error: 'fecha_fin no puede ser anterior a fecha_inicio' });
        }

        const dias = calcularDias(fecha_inicio, fecha_fin);

        try {
            // Verificar stock de todos los artículos antes de insertar
            for (const item of items) {
                if (!item.articulo_id || !item.cantidad || item.cantidad < 1) {
                    return res.status(400).json({ error: 'Cada item debe tener articulo_id y cantidad >= 1' });
                }
                await verificarDisponibilidad(item.articulo_id, item.cantidad, fecha_inicio, fecha_fin);
            }

            // Buscar precios actuales de los artículos (si no vienen en el body)
            const itemsConPrecio = await Promise.all(
                items.map((item) =>
                    new Promise((resolve, reject) => {
                        db.get('SELECT precio_por_dia FROM articulos WHERE id = ?', [item.articulo_id], (err, a) => {
                            if (err) return reject(err);
                            resolve({
                                ...item,
                                precio_unitario_dia: item.precio_unitario_dia !== undefined
                                    ? item.precio_unitario_dia
                                    : a.precio_por_dia,
                            });
                        });
                    })
                )
            );

            // Calcular precio total
            const precio_total = itemsConPrecio.reduce(
                (acc, item) => acc + item.precio_unitario_dia * item.cantidad * dias,
                0
            );

            // Insertar alquiler
            db.run(
                `INSERT INTO alquileres (cliente_id, fecha_inicio, fecha_fin, estado, precio_total, notas)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    cliente_id,
                    fecha_inicio,
                    fecha_fin,
                    estado || 'pendiente',
                    precio_total,
                    notas || null,
                ],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    const alquiler_id = this.lastID;

                    // Insertar items
                    const stmt = db.prepare(
                        'INSERT INTO alquiler_items (alquiler_id, articulo_id, cantidad, precio_unitario_dia) VALUES (?, ?, ?, ?)'
                    );
                    for (const item of itemsConPrecio) {
                        stmt.run([alquiler_id, item.articulo_id, item.cantidad, item.precio_unitario_dia]);
                    }
                    stmt.finalize((err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        getAlquilerCompleto(alquiler_id, (err, alquiler) => {
                            if (err) return res.status(500).json({ error: err.message });
                            res.status(201).json(alquiler);
                        });
                    });
                }
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

    // ── PUT /api/alquileres/:id — actualizar alquiler completo ─────────────────
    router.put('/:id', async (req, res) => {
        const { cliente_id, fecha_inicio, fecha_fin, estado, notas, items } = req.body;
        const alquiler_id = req.params.id;

        if (!cliente_id || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'cliente_id, fecha_inicio y fecha_fin son obligatorios' });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Se requiere al menos un artículo en items' });
        }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            return res.status(400).json({ error: 'fecha_fin no puede ser anterior a fecha_inicio' });
        }

        const dias = calcularDias(fecha_inicio, fecha_fin);

        try {
            for (const item of items) {
                if (!item.articulo_id || !item.cantidad || item.cantidad < 1) {
                    return res.status(400).json({ error: 'Cada item debe tener articulo_id y cantidad >= 1' });
                }
                await verificarDisponibilidad(item.articulo_id, item.cantidad, fecha_inicio, fecha_fin, alquiler_id);
            }

            const itemsConPrecio = await Promise.all(
                items.map((item) =>
                    new Promise((resolve, reject) => {
                        db.get('SELECT precio_por_dia FROM articulos WHERE id = ?', [item.articulo_id], (err, a) => {
                            if (err) return reject(err);
                            resolve({
                                ...item,
                                precio_unitario_dia: item.precio_unitario_dia !== undefined
                                    ? item.precio_unitario_dia
                                    : a.precio_por_dia,
                            });
                        });
                    })
                )
            );

            const precio_total = itemsConPrecio.reduce(
                (acc, item) => acc + item.precio_unitario_dia * item.cantidad * dias,
                0
            );

            db.run(
                `UPDATE alquileres
                 SET cliente_id = ?, fecha_inicio = ?, fecha_fin = ?,
                     estado = ?, precio_total = ?, notas = ?
                 WHERE id = ?`,
                [cliente_id, fecha_inicio, fecha_fin, estado || 'pendiente', precio_total, notas || null, alquiler_id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    if (this.changes === 0) return res.status(404).json({ error: 'Alquiler no encontrado' });

                    // Reemplazar items: borrar los viejos e insertar los nuevos
                    db.run('DELETE FROM alquiler_items WHERE alquiler_id = ?', [alquiler_id], (err) => {
                        if (err) return res.status(500).json({ error: err.message });

                        const stmt = db.prepare(
                            'INSERT INTO alquiler_items (alquiler_id, articulo_id, cantidad, precio_unitario_dia) VALUES (?, ?, ?, ?)'
                        );
                        for (const item of itemsConPrecio) {
                            stmt.run([alquiler_id, item.articulo_id, item.cantidad, item.precio_unitario_dia]);
                        }
                        stmt.finalize((err) => {
                            if (err) return res.status(500).json({ error: err.message });
                            getAlquilerCompleto(alquiler_id, (err, alquiler) => {
                                if (err) return res.status(500).json({ error: err.message });
                                res.json(alquiler);
                            });
                        });
                    });
                }
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

    // ── PATCH /api/alquileres/:id/estado — cambiar solo el estado ──────────────
    router.patch('/:id/estado', (req, res) => {
        const { estado } = req.body;
        const estadosValidos = ['pendiente', 'activo', 'devuelto', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` });
        }

        db.run(
            'UPDATE alquileres SET estado = ? WHERE id = ?',
            [estado, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Alquiler no encontrado' });
                getAlquilerCompleto(req.params.id, (err, alquiler) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json(alquiler);
                });
            }
        );
    });

    // ── DELETE /api/alquileres/:id — eliminar (solo si está cancelado o devuelto) ──
    router.delete('/:id', (req, res) => {
        db.get('SELECT estado FROM alquileres WHERE id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Alquiler no encontrado' });
            if (!['cancelado', 'devuelto'].includes(row.estado)) {
                return res.status(409).json({
                    error: 'Solo se pueden eliminar alquileres cancelados o devueltos',
                });
            }
            // ON DELETE CASCADE en alquiler_items se encarga de borrar los items
            db.run('DELETE FROM alquileres WHERE id = ?', [req.params.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Alquiler eliminado correctamente' });
            });
        });
    });

    return router;
};
