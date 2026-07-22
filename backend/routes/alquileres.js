// routes/alquileres.js
const express = require('express');
const { getDb } = require('../db');
const alquilerController = require("../controllers/alquiler.controller");


const router = express.Router();

const db = new Proxy(
    {},
    {
        get(_target, prop) {
            const conn = getDb();
            const value = conn[prop];
            return typeof value === 'function' ? value.bind(conn) : value;
        },
    },
);


    function runAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) return reject(err);
                resolve(this);
            });
        });
    }

    function getAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    function allAsync(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // Historial específico de alquileres vinculados a un artículo (Soporte para StockDetallePage.tsx)
    router.get('/articulo/:id', alquilerController.obtenerAlquileresPorArticulo);

    // Calcula la diferencia en días entre dos fechas (mínimo 1)
    function calcularDias(fecha_inicio, fecha_fin) {
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
        return diff < 1 ? 1 : diff;
    }

    // GET /api/alquileres/disponibilidad?articulo_id=1&fecha_inicio=2026-08-01&fecha_fin=2026-08-05
    router.get('/disponibilidad', async (req, res) => {
        const { articulo_id, fecha_inicio, fecha_fin, excluir_alquiler_id } = req.query;
        if (!articulo_id || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Faltan parámetros obligatorios (articulo_id, fecha_inicio, fecha_fin)' });
        }

        try {
            const articulo = await getAsync('SELECT id, nombre, stock_total FROM articulos WHERE id = ?', [articulo_id]);
            if (!articulo) {
                return res.status(404).json({ error: 'Artículo no encontrado' });
            }


            let query = `
                SELECT COALESCE(SUM(
                    CASE
                        WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                            THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                        ELSE 0
                    END
                ), 0) AS ocupadas
                FROM alquiler_items ai
                JOIN alquileres al ON ai.alquiler_id = al.id
                LEFT JOIN (
                    SELECT ac.alquiler_id, ci.alquiler_item_id, SUM(ci.cantidad_devuelta) AS cantidad_devuelta
                    FROM alquiler_cierres ac
                    JOIN alquiler_cierre_items ci ON ci.cierre_id = ac.id
                    GROUP BY ac.alquiler_id, ci.alquiler_item_id
                ) ciu ON ciu.alquiler_id = al.id AND ciu.alquiler_item_id = ai.id
                WHERE ai.articulo_id = ?
                AND al.estado NOT IN ('cancelado')
                AND al.fecha_inicio <= ?
                AND al.fecha_fin   >= ?
            `;
            const params = [articulo_id, fecha_fin, fecha_inicio];

            if (excluir_alquiler_id) {
                query += ' AND al.id != ?';
                params.push(excluir_alquiler_id);
            }

            const row = await getAsync(query, params);
            const ocupadas = row ? row.ocupadas : 0;
            const disponibles = Math.max(0, articulo.stock_total - ocupadas);


            res.json({
                articulo_id: articulo.id,
                nombre: articulo.nombre,
                stock_total: articulo.stock_total,
                ocupadas,
                disponibles,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Verifica disponibilidad de un artículo para un rango, excluyendo un alquiler_id (para ediciones)
    function verificarDisponibilidad(
        articulo_id,
        cantidad,
        fecha_inicio,
        fecha_fin,
        excluir_alquiler_id = null,
    ) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT stock_total FROM articulos WHERE id = ?',
                [articulo_id],
                (err, articulo) => {
                    if (err) return reject(err);
                    if (!articulo)
                        return reject(
                            new Error(`Artículo ${articulo_id} no encontrado`),
                        );
                    // Coalesce suma la cantidad pendiente de devolución, si no hay nada, devuelve 0
                    let query = `
                    SELECT COALESCE(SUM(
                        CASE
                            WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                                THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                            ELSE 0
                        END
                    ), 0) AS ocupadas
                    FROM alquiler_items ai
                    JOIN alquileres al ON ai.alquiler_id = al.id
                    LEFT JOIN (
                        SELECT ac.alquiler_id, ci.alquiler_item_id, SUM(ci.cantidad_devuelta) AS cantidad_devuelta
                        FROM alquiler_cierres ac
                        JOIN alquiler_cierre_items ci ON ci.cierre_id = ac.id
                        GROUP BY ac.alquiler_id, ci.alquiler_item_id
                    ) ciu ON ciu.alquiler_id = al.id AND ciu.alquiler_item_id = ai.id
                    WHERE ai.articulo_id = ?
                      AND al.estado NOT IN ('cancelado')
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
                            reject(
                                new Error(
                                    `Stock insuficiente para artículo ${articulo_id}: ` +
                                        `disponibles ${disponibles}, solicitados ${cantidad}`,
                                ),
                            );
                        } else {
                            resolve(true);
                        }
                    });
                },
            );
        });
    }

    function calcularPrecioTotal(items, dias) {
        return items.reduce(
            (acc, item) =>
                acc + item.precio_unitario_dia * item.cantidad * dias,
            0,
        );
    }
    // Obtiene un alquiler completo (con cliente e items)
    function getAlquilerCompleto(id, callback) {
        db.get(
            `SELECT al.*, c.nombre AS cliente_nombre, c.email AS cliente_email, c.telefono AS cliente_telefono,
                    COALESCE(ac.estado_entrega, 'pendiente') AS cierre_estado_entrega,
                    ac.id AS cierre_id,
                    ac.observaciones AS cierre_observaciones,
                    ac.recargo_roturas AS cierre_recargo_roturas,
                    ac.recargo_tarde AS cierre_recargo_tarde,
                    ac.recargo_otros AS cierre_recargo_otros,
                    ac.total_recargos AS cierre_total_recargos,
                    ac.fecha_cierre AS cierre_fecha_cierre
             FROM alquileres al
             JOIN clientes c ON al.cliente_id = c.id
             LEFT JOIN alquiler_cierres ac ON ac.alquiler_id = al.id
             WHERE al.id = ?`,
            [id],
            (err, alquiler) => {
                if (err) return callback(err);
                if (!alquiler) return callback(null, null);

                db.all(
                    `SELECT ai.*, a.nombre AS articulo_nombre, a.precio_por_dia AS precio_articulo_actual,
                            ci.id AS cierre_item_id,
                            ci.cantidad_devuelta,
                            ci.estado_fisico AS cierre_estado_fisico,
                            ci.observaciones AS cierre_observaciones,
                            ci.recargo_item AS cierre_recargo_item
                     FROM alquiler_items ai
                     JOIN articulos a ON ai.articulo_id = a.id
                     LEFT JOIN alquiler_cierres ac ON ac.alquiler_id = ai.alquiler_id
                     LEFT JOIN alquiler_cierre_items ci ON ci.cierre_id = ac.id AND ci.alquiler_item_id = ai.id
                     WHERE ai.alquiler_id = ?`,
                    [id],
                    (err, items) => {
                        if (err) return callback(err);
                        db.all(
                            `SELECT ci.*, ai.id AS alquiler_item_id, ai.cantidad AS cantidad_prestada, a.nombre AS articulo_nombre
                             FROM alquiler_cierre_items ci
                             JOIN alquiler_items ai ON ci.alquiler_item_id = ai.id
                             JOIN articulos a ON ai.articulo_id = a.id
                             WHERE ci.cierre_id = ?
                             ORDER BY ai.id`,
                            [alquiler.cierre_id],
                            (err, cierreItems) => {
                                if (err) return callback(err);
                                const cierre = alquiler.cierre_id
                                    ? {
                                          id: alquiler.cierre_id,
                                          observaciones:
                                              alquiler.cierre_observaciones,
                                          recargo_roturas:
                                              alquiler.cierre_recargo_roturas,
                                          recargo_tarde:
                                              alquiler.cierre_recargo_tarde,
                                          recargo_otros:
                                              alquiler.cierre_recargo_otros,
                                          total_recargos:
                                              alquiler.cierre_total_recargos,
                                          estado_entrega:
                                              alquiler.cierre_estado_entrega,
                                          fecha_cierre:
                                              alquiler.cierre_fecha_cierre,
                                          items: cierreItems,
                                      }
                                    : null;

                                callback(null, { ...alquiler, items, cierre });
                            },
                        );
                    },
                );
            },
        );
    }

    // ── GET /api/alquileres — listar todos ─────────────────────────────────────
    router.get('/', (req, res) => {
        const { estado, cliente_id, fecha_inicio, fecha_fin } = req.query;
        const params = [];


        let query = `
            SELECT al.*, c.nombre AS cliente_nombre,
                (SELECT COUNT(*) FROM alquiler_items WHERE alquiler_id = al.id) AS cantidad_items,
                COALESCE(ac.estado_entrega, 'pendiente') AS cierre_estado_entrega,
                COALESCE(ac.total_recargos, 0) AS cierre_total_recargos
            FROM alquileres al
            JOIN clientes c ON al.cliente_id = c.id
            LEFT JOIN alquiler_cierres ac ON al.id = ac.alquiler_id
            WHERE 1=1            
        `;

        // el where 1=1 da siempre true, por lo que permite que construyamos condiciones adicionales con AND sin preocuparnos de si es la primera o no.

        if (estado) {
            query += ' AND al.estado = ?';
            params.push(estado);
        }
        if (cliente_id) {
            query += ' AND al.cliente_id = ?';
            params.push(cliente_id);
        }
        if (fecha_inicio) {
            query += ' AND al.fecha_fin >= ?';
            params.push(fecha_inicio);
        }
        if (fecha_fin) {
            query += ' AND al.fecha_inicio <= ?';
            params.push(fecha_fin);
        }

        query += ' GROUP BY al.id ORDER BY al.fecha_inicio DESC';

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // ── GET /api/alquileres/:id — obtener uno completo ─────────────────────────
    router.get('/:id', (req, res) => {
        getAlquilerCompleto(req.params.id, (err, alquiler) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!alquiler)
                return res
                    .status(404)
                    .json({ error: 'Alquiler no encontrado' });
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
        const {
            cliente_id,
            fecha_inicio,
            fecha_fin,
            estado,
            deposito_garantia,
            notas,
            items,
        } = req.body;

        // Validaciones básicas
        if (!cliente_id)
            return res.status(400).json({ error: 'cliente_id es obligatorio' });
        if (!fecha_inicio)
            return res
                .status(400)
                .json({ error: 'fecha_inicio es obligatoria' });
        if (!fecha_fin)
            return res.status(400).json({ error: 'fecha_fin es obligatoria' });
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res
                .status(400)
                .json({ error: 'Se requiere al menos un artículo en items' });
        }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            return res.status(400).json({
                error: 'fecha_fin no puede ser anterior a fecha_inicio',
            });
        }

        const dias = calcularDias(fecha_inicio, fecha_fin);

        try {
            // Verificar stock de todos los artículos antes de insertar
            for (const item of items) {
                if (!item.articulo_id || !item.cantidad || item.cantidad < 1) {
                    return res.status(400).json({
                        error: 'Cada item debe tener articulo_id y cantidad >= 1',
                    });
                }
                await verificarDisponibilidad(
                    item.articulo_id,
                    item.cantidad,
                    fecha_inicio,
                    fecha_fin,
                );
            }

            // Buscar precios actuales de los artículos (si no vienen en el body)
            const itemsConPrecio = await Promise.all(
                items.map(
                    (item) =>
                        new Promise((resolve, reject) => {
                            db.get(
                                'SELECT precio_por_dia FROM articulos WHERE id = ?',
                                [item.articulo_id],
                                (err, a) => {
                                    if (err) return reject(err);
                                    resolve({
                                        ...item,
                                        precio_unitario_dia:
                                            item.precio_unitario_dia !==
                                            undefined
                                                ? item.precio_unitario_dia
                                                : a.precio_por_dia,
                                    });
                                },
                            );
                        }),
                ),
            );

            // Calcular precio total
            const precio_total = calcularPrecioTotal(itemsConPrecio, dias);

            // Insertar alquiler
            db.run(
                `INSERT INTO alquileres (cliente_id, fecha_inicio, fecha_fin, estado, precio_total, deposito_garantia, notas)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    cliente_id,
                    fecha_inicio,
                    fecha_fin,
                    estado || 'pendiente',
                    precio_total,
                    Number(deposito_garantia) || 0,
                    notas || null,
                ],
                function (err) {
                    if (err)
                        return res.status(500).json({ error: err.message });
                    const alquiler_id = this.lastID;

                    // Insertar items
                    const stmt = db.prepare(
                        'INSERT INTO alquiler_items (alquiler_id, articulo_id, cantidad, precio_unitario_dia) VALUES (?, ?, ?, ?)',
                    );
                    for (const item of itemsConPrecio) {
                        stmt.run([
                            alquiler_id,
                            item.articulo_id,
                            item.cantidad,
                            item.precio_unitario_dia,
                        ]);
                    }
                    stmt.finalize((err) => {
                        if (err)
                            return res.status(500).json({ error: err.message });
                        getAlquilerCompleto(alquiler_id, (err, alquiler) => {
                            if (err)
                                return res
                                    .status(500)
                                    .json({ error: err.message });
                            res.status(201).json(alquiler);
                        });
                    });
                },
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

    // ── PUT /api/alquileres/:id — actualizar alquiler completo ─────────────────
    router.put('/:id', async (req, res) => {
        const {
            cliente_id,
            fecha_inicio,
            fecha_fin,
            estado,
            deposito_garantia,
            notas,
            items,
        } = req.body;
        const alquiler_id = req.params.id;

        if (!cliente_id || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                error: 'cliente_id, fecha_inicio y fecha_fin son obligatorios',
            });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res
                .status(400)
                .json({ error: 'Se requiere al menos un artículo en items' });
        }
        if (new Date(fecha_fin) < new Date(fecha_inicio)) {
            return res.status(400).json({
                error: 'fecha_fin no puede ser anterior a fecha_inicio',
            });
        }

        const dias = calcularDias(fecha_inicio, fecha_fin);

        try {
            for (const item of items) {
                if (!item.articulo_id || !item.cantidad || item.cantidad < 1) {
                    return res.status(400).json({
                        error: 'Cada item debe tener articulo_id y cantidad >= 1',
                    });
                }
                await verificarDisponibilidad(
                    item.articulo_id,
                    item.cantidad,
                    fecha_inicio,
                    fecha_fin,
                    alquiler_id,
                );
            }

            const itemsConPrecio = await Promise.all(
                items.map(
                    (item) =>
                        new Promise((resolve, reject) => {
                            db.get(
                                'SELECT precio_por_dia FROM articulos WHERE id = ?',
                                [item.articulo_id],
                                (err, a) => {
                                    if (err) return reject(err);
                                    resolve({
                                        ...item,
                                        precio_unitario_dia:
                                            item.precio_unitario_dia !==
                                            undefined
                                                ? item.precio_unitario_dia
                                                : a.precio_por_dia,
                                    });
                                },
                            );
                        }),
                ),
            );

            const precio_total = itemsConPrecio.reduce(
                (acc, item) =>
                    acc + item.precio_unitario_dia * item.cantidad * dias,
                0,
            );

            db.run(
                `UPDATE alquileres
                 SET cliente_id = ?, fecha_inicio = ?, fecha_fin = ?,
                     estado = ?, precio_total = ?, deposito_garantia = ?, notas = ?
                 WHERE id = ?`,
                [
                    cliente_id,
                    fecha_inicio,
                    fecha_fin,
                    estado || 'pendiente',
                    precio_total,
                    Number(deposito_garantia) || 0,
                    notas || null,
                    alquiler_id,
                ],
                function (err) {
                    if (err)
                        return res.status(500).json({ error: err.message });
                    if (this.changes === 0)
                        return res
                            .status(404)
                            .json({ error: 'Alquiler no encontrado' });

                    // Reemplazar items: borrar los viejos e insertar los nuevos
                    db.run(
                        'DELETE FROM alquiler_items WHERE alquiler_id = ?',
                        [alquiler_id],
                        (err) => {
                            if (err)
                                return res
                                    .status(500)
                                    .json({ error: err.message });

                            const stmt = db.prepare(
                                'INSERT INTO alquiler_items (alquiler_id, articulo_id, cantidad, precio_unitario_dia) VALUES (?, ?, ?, ?)',
                            );
                            for (const item of itemsConPrecio) {
                                stmt.run([
                                    alquiler_id,
                                    item.articulo_id,
                                    item.cantidad,
                                    item.precio_unitario_dia,
                                ]);
                            }
                            stmt.finalize((err) => {
                                if (err)
                                    return res
                                        .status(500)
                                        .json({ error: err.message });
                                getAlquilerCompleto(
                                    alquiler_id,
                                    (err, alquiler) => {
                                        if (err)
                                            return res
                                                .status(500)
                                                .json({ error: err.message });
                                        res.json(alquiler);
                                    },
                                );
                            });
                        },
                    );
                },
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

    // ── PUT /api/alquileres/:id/cierre — guardar cierre del alquiler ─────────
    router.put('/:id/cierre', async (req, res) => {
        const alquilerId = req.params.id;
        const {
            observaciones = null,
            recargo_roturas = 0,
            recargo_tarde = 0,
            recargo_otros = 0,
            items = [],
        } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Se requiere el detalle de entrega por cada ítem',
            });
        }

        try {
            const alquiler = await getAsync(
                'SELECT id, estado FROM alquileres WHERE id = ?',
                [alquilerId],
            );
            if (!alquiler)
                return res
                    .status(404)
                    .json({ error: 'Alquiler no encontrado' });
            if (alquiler.estado === 'cancelado') {
                return res.status(409).json({
                    error: 'No se puede cerrar un alquiler cancelado',
                });
            }

            const alquilerItems = await allAsync(
                'SELECT id, cantidad FROM alquiler_items WHERE alquiler_id = ? ORDER BY id',
                [alquilerId],
            );

            if (alquilerItems.length === 0) {
                return res
                    .status(400)
                    .json({ error: 'El alquiler no tiene ítems para cerrar' });
            }

            const itemsPorId = new Map(
                alquilerItems.map((item) => [String(item.id), item]),
            );
            const cierreItems = [];
            const itemsRecibidos = new Set();

            for (const rawItem of items) {
                const alquiler_item_id = String(rawItem.alquiler_item_id ?? '');
                const itemBase = itemsPorId.get(alquiler_item_id);
                if (!itemBase) {
                    return res.status(400).json({
                        error: `El item ${alquiler_item_id} no pertenece al alquiler`,
                    });
                }

                const cantidadDevuelta = Number(
                    rawItem.cantidad_devuelta !== undefined
                        ? rawItem.cantidad_devuelta
                        : rawItem.entregado
                          ? itemBase.cantidad
                          : 0,
                );

                if (
                    !Number.isFinite(cantidadDevuelta) ||
                    cantidadDevuelta < 0 ||
                    cantidadDevuelta > itemBase.cantidad
                ) {
                    return res.status(400).json({
                        error: `Cantidad devuelta inválida para el item ${alquiler_item_id}`,
                    });
                }

                const estadoFisico = rawItem.estado_fisico || 'ok';
                if (!['ok', 'daniado', 'perdido'].includes(estadoFisico)) {
                    return res.status(400).json({
                        error: `Estado físico inválido para el item ${alquiler_item_id}`,
                    });
                }

                const recargoItem = Number(rawItem.recargo_item || 0);
                if (!Number.isFinite(recargoItem) || recargoItem < 0) {
                    return res.status(400).json({
                        error: `Recargo inválido para el item ${alquiler_item_id}`,
                    });
                }

                itemsRecibidos.add(alquiler_item_id);
                cierreItems.push({
                    alquiler_item_id: Number(alquiler_item_id),
                    cantidad_prestada: itemBase.cantidad,
                    cantidad_devuelta: cantidadDevuelta,
                    estado_fisico: estadoFisico,
                    observaciones: rawItem.observaciones || null,
                    recargo_item: recargoItem,
                });
            }

            if (itemsRecibidos.size !== alquilerItems.length) {
                return res.status(400).json({
                    error: 'Debes completar el cierre de todos los ítems del alquiler',
                });
            }

            const totalRecargos =
                Number(recargo_roturas || 0) +
                Number(recargo_tarde || 0) +
                Number(recargo_otros || 0) +
                cierreItems.reduce((acc, item) => acc + item.recargo_item, 0);
            const estadoEntrega = cierreItems.every(
                (item) => item.cantidad_devuelta >= item.cantidad_prestada,
            )
                ? 'cerrado'
                : 'parcial';
            const estadoAlquiler = estadoEntrega === 'cerrado' ? 'devuelto' : 'activo';

            await runAsync('BEGIN TRANSACTION');

            try {
                const cierreExistente = await getAsync(
                    'SELECT id FROM alquiler_cierres WHERE alquiler_id = ?',
                    [alquilerId],
                );
                let cierreId = cierreExistente ? cierreExistente.id : null;

                if (cierreId) {
                    await runAsync(
                        `UPDATE alquiler_cierres
                         SET observaciones = ?, recargo_roturas = ?, recargo_tarde = ?, recargo_otros = ?,
                             total_recargos = ?, estado_entrega = ?, fecha_cierre = datetime('now','localtime'),
                             updated_at = datetime('now','localtime')
                         WHERE alquiler_id = ?`,
                        [
                            observaciones,
                            recargo_roturas || 0,
                            recargo_tarde || 0,
                            recargo_otros || 0,
                            totalRecargos,
                            estadoEntrega,
                            alquilerId,
                        ],
                    );
                } else {
                    const insertResult = await runAsync(
                        `INSERT INTO alquiler_cierres (
                            alquiler_id, observaciones, recargo_roturas, recargo_tarde, recargo_otros,
                            total_recargos, estado_entrega, fecha_cierre
                         ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))`,
                        [
                            alquilerId,
                            observaciones,
                            recargo_roturas || 0,
                            recargo_tarde || 0,
                            recargo_otros || 0,
                            totalRecargos,
                            estadoEntrega,
                        ],
                    );
                    cierreId = insertResult.lastID;
                }

                await runAsync(
                    'DELETE FROM alquiler_cierre_items WHERE cierre_id = ?',
                    [cierreId],
                );

                for (const item of cierreItems) {
                    await runAsync(
                        `INSERT INTO alquiler_cierre_items (
                            cierre_id, alquiler_item_id, cantidad_prestada, cantidad_devuelta,
                            estado_fisico, observaciones, recargo_item
                         ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            cierreId,
                            item.alquiler_item_id,
                            item.cantidad_prestada,
                            item.cantidad_devuelta,
                            item.estado_fisico,
                            item.observaciones,
                            item.recargo_item,
                        ],
                    );
                }

                await runAsync(
                    'UPDATE alquileres SET estado = ? WHERE id = ?',
                    [estadoAlquiler, alquilerId],
                );
                await runAsync('COMMIT');
            } catch (err) {
                await runAsync('ROLLBACK');
                throw err;
            }

            getAlquilerCompleto(alquilerId, (err, alquilerActualizado) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(alquilerActualizado);
            });
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    });

    // ── PATCH /api/alquileres/:id/estado — cambiar solo el estado ──────────────
    router.patch('/:id/estado', (req, res) => {
        const { estado } = req.body;
        const estadosValidos = ['pendiente', 'activo', 'devuelto', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`,
            });
        }

        db.run(
            'UPDATE alquileres SET estado = ? WHERE id = ?',
            [estado, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0)
                    return res
                        .status(404)
                        .json({ error: 'Alquiler no encontrado' });
                getAlquilerCompleto(req.params.id, (err, alquiler) => {
                    if (err)
                        return res.status(500).json({ error: err.message });
                    res.json(alquiler);
                });
            },
        );
    });

    // ── DELETE /api/alquileres/:id — eliminar (solo si está cancelado o devuelto) ──
    router.delete('/:id', (req, res) => {
        db.get(
            'SELECT estado FROM alquileres WHERE id = ?',
            [req.params.id],
            (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row)
                    return res
                        .status(404)
                        .json({ error: 'Alquiler no encontrado' });
                if (!['cancelado', 'devuelto'].includes(row.estado)) {
                    return res.status(409).json({
                        error: 'Solo se pueden eliminar alquileres cancelados o devueltos',
                    });
                }
                // ON DELETE CASCADE en alquiler_items se encarga de borrar los items
                db.run(
                    'DELETE FROM alquileres WHERE id = ?',
                    [req.params.id],
                    function (err) {
                        if (err)
                            return res.status(500).json({ error: err.message });
                        res.json({
                            message: 'Alquiler eliminado correctamente',
                        });
                    },
                );
            },
        );
    });

    

module.exports = router;
