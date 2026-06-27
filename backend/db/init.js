const { getDb } = require('./index'); // Asegúrate de que apunte bien a tu archivo de conexión

function initializeTables() {
  const db = getDb();

  db.serialize(() => {
    // 1. Categorías
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre      TEXT    NOT NULL UNIQUE,
        descripcion TEXT,
        created_at  TEXT    DEFAULT (datetime('now','localtime'))
      )
    `);

    // 2. Artículos
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

    // 3. Clientes
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

    // 4. Alquileres
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

    // 5. Usuarios (¡La tabla se queda, las consultas SELECT/INSERT de abajo se van!)
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        username    TEXT NOT NULL UNIQUE,
        password    TEXT NOT NULL,
        created_at  TEXT DEFAULT (datetime('now','localtime'))
      )
    `);

    // 6. Alquiler Items
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

    // 7. Costos
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