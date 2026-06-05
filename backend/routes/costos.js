const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/costos?mes=2025-06 — listar costos (opcionalmente filtrar por mes)
    router.get('/', (req, res) => {
        const { mes, anio } = req.query; // mes: "2025-06", anio: "2025"
        let query = 'SELECT * FROM costos WHERE 1=1';
        const params = [];

        if (mes) {
            query += " AND strftime('%Y-%m', fecha) = ?";
            params.push(mes);
        } else if (anio) {
            query += " AND strftime('%Y', fecha) = ?";
            params.push(anio);
        }
        query += ' ORDER BY fecha DESC';

        db.all(query, params, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // GET /api/costos/:id
    router.get('/:id', (req, res) => {
        db.get('SELECT * FROM costos WHERE id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Costo no encontrado' });
            res.json(row);
        });
    });

    // POST /api/costos — registrar un costo
    router.post('/', (req, res) => {
        const { descripcion, monto, fecha } = req.body;
        if (!descripcion) return res.status(400).json({ error: 'La descripción es obligatoria' });
        if (!monto || monto <= 0) return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
        if (!fecha) return res.status(400).json({ error: 'La fecha es obligatoria' });

        db.run(
            'INSERT INTO costos (descripcion, monto, fecha) VALUES (?, ?, ?)',
            [descripcion, monto, fecha],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                db.get('SELECT * FROM costos WHERE id = ?', [this.lastID], (err, row) => {
                    res.status(201).json(row);
                });
            }
        );
    });

    // PUT /api/costos/:id — actualizar
    router.put('/:id', (req, res) => {
        const { descripcion, monto, fecha } = req.body;
        if (!descripcion || !monto || !fecha) {
            return res.status(400).json({ error: 'descripcion, monto y fecha son obligatorios' });
        }

        db.run(
            'UPDATE costos SET descripcion = ?, monto = ?, fecha = ? WHERE id = ?',
            [descripcion, monto, fecha, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Costo no encontrado' });
                db.get('SELECT * FROM costos WHERE id = ?', [req.params.id], (err, row) => {
                    res.json(row);
                });
            }
        );
    });

    // DELETE /api/costos/:id
    router.delete('/:id', (req, res) => {
        db.run('DELETE FROM costos WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Costo no encontrado' });
            res.json({ message: 'Costo eliminado correctamente' });
        });
    });

    return router;
};
