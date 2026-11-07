const express = require('express');
const { getDb } = require('../db');
const authenticate = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();
router.use(authenticate);
// Todas las estadísticas requieren el permiso correspondiente
router.use(checkPermission('permiso_para_ver_estadisticas'));
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

    // ── GET /api/estadisticas/resumen?mes=2025-06 ──────────────────────────────
    // Devuelve ingresos brutos, ROI, totales y conteo por estado.
    // Si no se pasa ?mes, calcula el mes actual.
    router.get('/resumen', (req, res) => {
        const mes = req.query.mes || new Date().toISOString().slice(0, 7); // "YYYY-MM"

        const queryIngresos = `
            SELECT COALESCE(SUM(precio_total), 0) AS ingresos_brutos,
                   COUNT(*) AS total_alquileres
            FROM alquileres
            WHERE estado NOT IN ('cancelado')
              AND strftime('%Y-%m', fecha_inicio) = ?
        `;

        // Inversión total: suma del valor estimado del inventario activo.
        const queryInversion = `
            SELECT COALESCE(SUM(precio_por_dia * stock_total * 30), 0) AS inversion_estimada
            FROM articulos
            WHERE activo = 1
        `;

        // Totales históricos y conteo por estado efectivo (igual criterio que
        // GET /api/alquileres: pendiente/activo con fecha_fin pasada = vencido).
        const queryExtras = `
            SELECT
                (SELECT COUNT(*) FROM clientes) AS total_clientes,
                (SELECT COUNT(*) FROM alquileres) AS total_alquileres_historicos,
                (SELECT COUNT(*) FROM alquileres
                    WHERE estado = 'activo'
                      AND date(fecha_fin) >= date('now','localtime')) AS activos,
                (SELECT COUNT(*) FROM alquileres
                    WHERE estado = 'pendiente'
                      AND date(fecha_fin) >= date('now','localtime')) AS pendientes,
                (SELECT COUNT(*) FROM alquileres
                    WHERE estado = 'vencido'
                       OR (estado IN ('activo','pendiente')
                           AND date(fecha_fin) < date('now','localtime'))) AS vencidos,
                (SELECT COUNT(*) FROM alquileres WHERE estado = 'devuelto') AS devueltos,
                (SELECT COUNT(*) FROM alquileres WHERE estado = 'cancelado') AS cancelados,
                (SELECT COUNT(*) FROM alquiler_cierres WHERE total_recargos > 0) AS con_recargos
        `;

        db.get(queryIngresos, [mes], (err, ingresosRow) => {
            if (err) return res.status(500).json({ error: err.message });

            db.get(queryInversion, [], (err, inversionRow) => {
                if (err) return res.status(500).json({ error: err.message });

                db.get(queryExtras, [], (err, extrasRow) => {
                    if (err) return res.status(500).json({ error: err.message });

                    const ingresos_brutos = ingresosRow.ingresos_brutos;
                    const inversion = inversionRow.inversion_estimada;
                    const roi_mensual = inversion > 0
                        ? ((ingresos_brutos / inversion) * 100).toFixed(2)
                        : null;

                    res.json({
                        mes,
                        ingresos_brutos,
                        roi_mensual_porcentaje: roi_mensual ? parseFloat(roi_mensual) : null,
                        roi_anual_porcentaje: roi_mensual ? parseFloat((roi_mensual * 12).toFixed(2)) : null,
                        inversion_estimada: inversion,
                        total_alquileres: ingresosRow.total_alquileres,
                        total_clientes: extrasRow.total_clientes,
                        alquileres_con_recargos: extrasRow.con_recargos,
                        alquileres_por_estado: {
                            total: extrasRow.total_alquileres_historicos,
                            activos: extrasRow.activos,
                            pendientes: extrasRow.pendientes,
                            vencidos: extrasRow.vencidos,
                            devueltos: extrasRow.devueltos,
                            cancelados: extrasRow.cancelados,
                        },
                    });
                });
            });
        });
    });

    // ── GET /api/estadisticas/ingresos-por-mes?anio=2025 ──────────────────────
    // Devuelve ingresos mes a mes para graficar
    router.get('/ingresos-por-mes', (req, res) => {
        const anio = req.query.anio || new Date().getFullYear();

        db.all(
            `SELECT strftime('%Y-%m', fecha_inicio) AS mes,
                    COALESCE(SUM(precio_total), 0)  AS ingresos,
                    COUNT(*)                         AS cantidad_alquileres
             FROM alquileres
             WHERE estado NOT IN ('cancelado')
               AND strftime('%Y', fecha_inicio) = ?
             GROUP BY mes
             ORDER BY mes`,
            [String(anio)],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

    // ── GET /api/estadisticas/articulos-mas-alquilados?limit=10 ───────────────
    router.get('/articulos-mas-alquilados', (req, res) => {
        const limit = parseInt(req.query.limit) || 10;
        const { mes, anio } = req.query;

        let filtroFecha = '';
        const params = [];

        if (mes) {
            filtroFecha = "AND strftime('%Y-%m', al.fecha_inicio) = ?";
            params.push(mes);
        } else if (anio) {
            filtroFecha = "AND strftime('%Y', al.fecha_inicio) = ?";
            params.push(String(anio));
        }
        params.push(limit);

        db.all(
            `SELECT a.id, a.nombre, cat.nombre AS categoria,
                    SUM(ai.cantidad)                               AS unidades_alquiladas,
                    COUNT(DISTINCT ai.alquiler_id)                 AS veces_alquilado,
                    SUM(ai.cantidad * ai.precio_unitario_dia)      AS ingresos_generados
             FROM alquiler_items ai
             JOIN articulos a   ON ai.articulo_id  = a.id
             JOIN alquileres al ON ai.alquiler_id  = al.id
             LEFT JOIN categorias cat ON a.categoria_id = cat.id
             WHERE al.estado NOT IN ('cancelado')
             ${filtroFecha}
             GROUP BY a.id
             ORDER BY unidades_alquiladas DESC
             LIMIT ?`,
            params,
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

    // ── GET /api/estadisticas/clientes-frecuentes?limit=10 ────────────────────
    router.get('/clientes-frecuentes', (req, res) => {
        const limit = parseInt(req.query.limit) || 10;

        db.all(
            `SELECT c.id, c.nombre, c.email, c.telefono,
                    COUNT(al.id)             AS total_alquileres,
                    SUM(al.precio_total)     AS total_gastado,
                    MAX(al.fecha_inicio)     AS ultimo_alquiler
             FROM clientes c
             JOIN alquileres al ON c.id = al.cliente_id
             WHERE al.estado NOT IN ('cancelado')
             GROUP BY c.id
             ORDER BY total_alquileres DESC
             LIMIT ?`,
            [limit],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

    // ── GET /api/estadisticas/calendario?fecha_inicio=&fecha_fin= ─────────────
    // Para el calendario: alquileres en un rango de fechas con sus items
    router.get('/calendario', (req, res) => {
        const { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
        }

        db.all(
            `SELECT al.id, al.fecha_inicio, al.fecha_fin, al.estado, al.precio_total,
                    c.nombre  AS cliente_nombre,
                    c.telefono AS cliente_telefono,
                    GROUP_CONCAT(a.nombre || ' (x' || ai.cantidad || ')', ', ') AS articulos
             FROM alquileres al
             JOIN clientes c ON al.cliente_id = c.id
             JOIN alquiler_items ai ON al.id = ai.alquiler_id
             JOIN articulos a ON ai.articulo_id = a.id
             WHERE al.estado NOT IN ('cancelado')
               AND al.fecha_inicio <= ?
               AND al.fecha_fin   >= ?
             GROUP BY al.id
             ORDER BY al.fecha_inicio`,
            [fecha_fin, fecha_inicio],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

    // ── GET /api/estadisticas/stock-disponible?fecha_inicio=&fecha_fin= ───────
    // Muestra disponibilidad de todos los artículos para un rango de fechas
    router.get('/stock-disponible', (req, res) => {
        const { fecha_inicio, fecha_fin } = req.query;
        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
        }

        db.all(
            `SELECT a.id, a.nombre, a.stock_total, cat.nombre AS categoria,
                    COALESCE(SUM(CASE
                        WHEN al.estado NOT IN ('cancelado')
                         AND al.fecha_inicio <= ?
                         AND al.fecha_fin   >= ?
                        THEN CASE
                            WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                                THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                            ELSE 0
                        END
                        ELSE 0
                    END), 0) AS ocupadas,
                    a.stock_total - COALESCE(SUM(CASE
                        WHEN al.estado NOT IN ('cancelado')
                         AND al.fecha_inicio <= ?
                         AND al.fecha_fin   >= ?
                        THEN CASE
                            WHEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0) > 0
                                THEN ai.cantidad - COALESCE(ciu.cantidad_devuelta, 0)
                            ELSE 0
                        END
                        ELSE 0
                    END), 0) AS disponibles
             FROM articulos a
             LEFT JOIN categorias cat ON a.categoria_id = cat.id
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
             ORDER BY a.nombre`,
            [fecha_fin, fecha_inicio, fecha_fin, fecha_inicio],
            (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            }
        );
    });

module.exports = router;
