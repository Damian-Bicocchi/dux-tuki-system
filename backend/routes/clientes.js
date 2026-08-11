const express = require('express');
const db = require('../db/index'); 
const { getDb } = require('../db'); // <-- Reclama tu instancia de DB directamente aquí
const router = express.Router();

// GET /api/clientes — listar todos
router.get('/', (req, res) => {
    const db = getDb();
    const { search } = req.query;
    let query = 'SELECT * FROM clientes';
    const params = [];

    if (search) {
        query += ' WHERE nombre LIKE ? OR email LIKE ? OR telefono LIKE ?';
        const term = `%${search}%`;
        params.push(term, term, term);
    }
    query += ' ORDER BY nombre';

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);

    });
});

// GET /api/clientes/:id — obtener uno con su historial de alquileres
router.get('/:id', (req, res) => {
    const db = getDb();
    db.get('SELECT * FROM clientes WHERE id = ?', [req.params.id], (err, cliente) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

        db.all(
            `SELECT al.*, 
                    COUNT(ai.id) AS cantidad_items
                FROM alquileres al
                LEFT JOIN alquiler_items ai ON al.id = ai.alquiler_id
                WHERE al.cliente_id = ?
                GROUP BY al.id
                ORDER BY al.fecha_inicio DESC`,
            [req.params.id],
            (err, alquileres) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...cliente, alquileres });
            }
        );
    });
});

// POST /api/clientes — crear
router.post('/', (req, res) => {
    const db = getDb();
    const { nombre, email, dni, telefono, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    db.run(
        'INSERT INTO clientes (nombre, email, dni, telefono, notas) VALUES (?, ?, ?, ?, ?)',
        [nombre, email || null, dni || null, telefono || null, notas || null],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Ya existe un cliente con ese email o dni' });
                }
                return res.status(500).json({ error: err.message });
            }
            db.get('SELECT * FROM clientes WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// PUT /api/clientes/:id — actualizar
router.put('/:id', (req, res) => {
    const db = getDb();
    const { nombre, email, dni, telefono, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

    db.run(
        'UPDATE clientes SET nombre = ?, email = ?, dni = ?, telefono = ?, notas = ? WHERE id = ?',
        [nombre, email || null, dni || null, telefono || null, notas || null, req.params.id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Ya existe un cliente con ese email o dni  ' });
                }
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
            db.get('SELECT * FROM clientes WHERE id = ?', [req.params.id], (err, row) => {
                res.json(row);
            });
        }
    );
});

// DELETE /api/clientes/:id — eliminar (solo si no tiene alquileres activos)
router.delete('/:id', (req, res) => {
    const db = getDb();
    db.get(
        `SELECT COUNT(*) as total FROM alquileres
            WHERE cliente_id = ? AND estado IN ('pendiente','activo')`,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row.total > 0) {
                return res.status(409).json({
                    error: 'No se puede eliminar: el cliente tiene alquileres activos o pendientes',
                });
            }
            db.run('DELETE FROM clientes WHERE id = ?', [req.params.id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
                res.json({ message: 'Cliente eliminado correctamente' });
            });
        }
    );
});

module.exports = router;
