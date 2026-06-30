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
    `, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

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
        deposito_garantia INTEGER NOT NULL DEFAULT 0,
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
        dni        TEXT UNIQUE,
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
        deposito_garantia REAL  NOT NULL DEFAULT 0,
        notas          TEXT,
        created_at     TEXT    DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

        // Migracion idempotente para bases existentes: agrega deposito_garantia si no existe.
        db.all(`PRAGMA table_info(alquileres)`, (err, columns = []) => {
          if (err) {
            console.error('Error al leer columnas de alquileres:', err.message);
            return;
          }
          const hasDepositoGarantia = columns.some(
            (col) => col.name === 'deposito_garantia',
          );
          if (!hasDepositoGarantia) {
            db.run(
              `ALTER TABLE alquileres ADD COLUMN deposito_garantia REAL NOT NULL DEFAULT 0`,
              (alterErr) => {
                if (alterErr) {
                  console.error(
                    'Error al agregar columna deposito_garantia:',
                    alterErr.message,
                  );
                  return;
                }
                console.log(
                  '✅ Columna deposito_garantia agregada en alquileres.',
                );
              },
            );
          }
        });

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

        // 7. Cierres de alquiler
        db.run(`
      CREATE TABLE IF NOT EXISTS alquiler_cierres (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        alquiler_id     INTEGER NOT NULL UNIQUE,
        observaciones   TEXT,
        recargo_roturas REAL NOT NULL DEFAULT 0,
        recargo_tarde   REAL NOT NULL DEFAULT 0,
        recargo_otros   REAL NOT NULL DEFAULT 0,
        total_recargos  REAL NOT NULL DEFAULT 0,
        estado_entrega  TEXT NOT NULL DEFAULT 'pendiente'
                        CHECK(estado_entrega IN ('pendiente','parcial','cerrado')),
        fecha_cierre    TEXT,
        created_at      TEXT DEFAULT (datetime('now','localtime')),
        updated_at      TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (alquiler_id) REFERENCES alquileres(id) ON DELETE CASCADE
      )
    `);

        // 8. Detalle de cierre por ítem
        db.run(`
      CREATE TABLE IF NOT EXISTS alquiler_cierre_items (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        cierre_id           INTEGER NOT NULL,
        alquiler_item_id    INTEGER NOT NULL,
        cantidad_prestada   INTEGER NOT NULL DEFAULT 1,
        cantidad_devuelta   INTEGER NOT NULL DEFAULT 0,
        estado_fisico       TEXT NOT NULL DEFAULT 'ok'
                            CHECK(estado_fisico IN ('ok','daniado','perdido')),
        observaciones       TEXT,
        recargo_item        REAL NOT NULL DEFAULT 0,
        created_at          TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (cierre_id) REFERENCES alquiler_cierres(id) ON DELETE CASCADE,
        FOREIGN KEY (alquiler_item_id) REFERENCES alquiler_items(id) ON DELETE CASCADE
      )
    `);

        // 9. Costos
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
