const { getDb } = require('./index');

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
module.exports = { initializeTables };