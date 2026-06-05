const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    // GET /api/categorias — listar todas
    router.get('/', (req, res) => {
        db.all('SELECT * FROM categorias ORDER BY nombre', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });

    // GET /api/categorias/:id — obtener una
    router.get('/:id', (req, res) => {
        db.get('SELECT * FROM categorias WHERE id = ?', [req.params.id], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Categoría no encontrada' });
            res.json(row);
        });
    });

    // POST /api/categorias — crear
    router.post('/', (req, res) => {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

        db.run(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion || null],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                db.get('SELECT * FROM categorias WHERE id = ?', [this.lastID], (err, row) => {
                    res.status(201).json(row);
                });
            }
        );
    });

    // PUT /api/categorias/:id — actualizar
    router.put('/:id', (req, res) => {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

        db.run(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre, descripcion || null, req.params.id],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
                db.get('SELECT * FROM categorias WHERE id = ?', [req.params.id], (err, row) => {
                    res.json(row);
                });
            }
        );
    });

    // DELETE /api/categorias/:id — eliminar
    router.delete('/:id', (req, res) => {
        db.run('DELETE FROM categorias WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
            res.json({ message: 'Categoría eliminada correctamente' });
        });
    });

    return router;
};
