const express = require('express');
const bcrypt = require('bcrypt');
const { getDb } = require('../db'); // <-- Reclama tu instancia de DB directamente aquí



const router = express.Router();

// POST /api/usuarios/login — login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    if (!username || !password) {
        return res
            .status(400)
            .json({ error: 'Username y password son obligatorios' });
    }

    db.get(
        'SELECT * FROM usuarios WHERE username = ?',
        [username],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row)
                return res
                    .status(401)
                    .json({ error: 'Credenciales inválidas' });

            bcrypt.compare(password, row.password, (err, match) => {
                if (err)
                    return res.status(500).json({ error: err.message });
                if (!match)
                    return res
                        .status(401)
                        .json({ error: 'Credenciales inválidas' });

                res.json({ id: row.id, username: row.username });
            });
        },
    );
});

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();
    if (!username || !password) {
        return res
            .status(400)
            .json({ error: 'Los campos son obligatorios' });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run(
            'INSERT INTO usuarios (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res
                            .status(409)
                            .json({ error: 'El username ya existe' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ id: this.lastID, username });
            },
        );
    });
});

module.exports = router;
