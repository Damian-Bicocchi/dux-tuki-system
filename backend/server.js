const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Hola1234'; 
const SALT_ROUNDS = 10;


// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Base de datos ────────────────────────────────────────────────────────────
const dbPath = path.resolve(__dirname, '../BD/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con la BD:', err.message);
    } else {
        console.log('✅ Conectado a la BD SQLite:', dbPath);
        db.run('PRAGMA foreign_keys = ON');
        initializeDatabase();
    }
});

// ─── Inicialización de tablas ─────────────────────────────────────────────────
function initializeDatabase() {
    db.serialize(() => {

        db.run(`
            CREATE TABLE IF NOT EXISTS categorias (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre      TEXT    NOT NULL UNIQUE,
                descripcion TEXT,
                created_at  TEXT    DEFAULT (datetime('now','localtime'))
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS articulos (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre         TEXT    NOT NULL,
                descripcion    TEXT,
                precio_por_dia REAL    NOT NULL DEFAULT 0,
                stock_total    INTEGER NOT NULL DEFAULT 0,
                categoria_id   INTEGER,
                activo         INTEGER NOT NULL DEFAULT 1,
                created_at     TEXT    DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (categoria_id) REFERENCES categorias(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS clientes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre     TEXT NOT NULL,
                email      TEXT UNIQUE,
                telefono   TEXT,
                notas      TEXT,
                created_at TEXT DEFAULT (datetime('now','localtime'))
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS alquileres (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id     INTEGER NOT NULL,
                fecha_inicio   TEXT    NOT NULL,
                fecha_fin      TEXT    NOT NULL,
                estado         TEXT    NOT NULL DEFAULT 'pendiente'
                                CHECK(estado IN ('pendiente','activo','devuelto','cancelado')),
                precio_total   REAL    NOT NULL DEFAULT 0,
                notas          TEXT,
                created_at     TEXT    DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id)
            )
        `);
        bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) {
                console.error('Error al hashear la contraseña del admin:', err.message);    
            } else {
                const dbPath = path.resolve(__dirname, '../BD/database.db');
                const db = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('Error al conectar con la BD para crear admin:', err.message);
                    }
                    db.run('PRAGMA foreign_keys = ON');
                    db.run(`
                        CREATE TABLE IF NOT EXISTS usuarios (
                            id          INTEGER PRIMARY KEY AUTOINCREMENT,
                            username    TEXT NOT NULL UNIQUE,
                            password    TEXT NOT NULL,
                            created_at  TEXT DEFAULT (datetime('now','localtime'))
                        );
                    `, () => {
                        db.get('SELECT * FROM usuarios WHERE username = ?', [ADMIN_USERNAME], (err, row) => {
                            if (err) {
                                console.error('Error al verificar existencia del admin:', err.message);
                            } else if (!row) {
                                db.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', [ADMIN_USERNAME, hashedPassword], function(err) {
                                    if (err) {
                                        console.error('Error al crear el usuario admin:', err.message);
                                    } else {
                                        console.log('Usuario admin creado con éxito');
                                    }
                                });
                            } else {
                                console.log('Usuario admin ya existe');
                            }
                        });
                    });
                });
            }
        });

        db.run(`
            CREATE TABLE IF NOT EXISTS alquiler_items (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                alquiler_id         INTEGER NOT NULL,
                articulo_id         INTEGER NOT NULL,
                cantidad            INTEGER NOT NULL DEFAULT 1,
                precio_unitario_dia REAL    NOT NULL DEFAULT 0,
                FOREIGN KEY (alquiler_id) REFERENCES alquileres(id) ON DELETE CASCADE,
                FOREIGN KEY (articulo_id) REFERENCES articulos(id)
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS costos (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                descripcion TEXT NOT NULL,
                monto       REAL NOT NULL,
                fecha       TEXT NOT NULL,
                created_at  TEXT DEFAULT (datetime('now','localtime'))
            )
        `);

        console.log('✅ Tablas inicializadas correctamente.');
    });
}

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/api/categorias',    require('./routes/categorias')(db));
app.use('/api/articulos',     require('./routes/articulos')(db));
app.use('/api/clientes',      require('./routes/clientes')(db));
app.use('/api/alquileres',    require('./routes/alquileres')(db));
app.use('/api/costos',        require('./routes/costos')(db));
app.use('/api/estadisticas',  require('./routes/estadisticas')(db));
app.use('/api/usuarios',       require('./routes/usuarios')(db));

// ─── Ruta raíz ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a la API de Dux Tuki System',
        version: '2.0.0',
        endpoints: [
            '/api/categorias',
            '/api/articulos',
            '/api/clientes',
            '/api/alquileres',
            '/api/costos',
            '/api/estadisticas',
            '/api/usuarios',
        ],
    });
});

// ─── Manejo de errores global ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    console.log(`🌍 http://localhost:${PORT}`);
});

// ─── Cierre ordenado ──────────────────────────────────────────────────────────
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Error cerrando la BD:', err.message);
        else console.log('🛑 Conexión a la BD cerrada.');
        process.exit(0);
    });
});
