const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Permite peticiones desde el frontend (CORS)
app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, '../BD/database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(
            '❌ Error al conectar con la base de datos SQLite:',
            err.message,
        );
    } else {
        console.log('✅ Conectado a la base de datos SQLite:', dbPath);
    }
});

function intializeDatabase(){
    const createClientesTable = `
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT
    )
    `;
    const createAlquileresTable = `
    CREATE TABLE IF NOT EXISTS alquileres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        fecha_inicio TEXT NOT NULL,
        fecha_fin TEXT NOT NULL,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
    `;
    db.run(createClientesTable, (err) => {
        if (err) {
            console.error('❌ Error al crear la tabla clientes:', err.message);
        } else {
            console.log('✅ Tabla clientes creada o ya existe.');
        }
    });

    db.run(createAlquileresTable, (err) => {
        if (err) {
            console.error('❌ Error al crear la tabla alquileres:', err.message);
        } else {
            console.log('✅ Tabla alquileres creada o ya existe.');
        }
    });
}

// Ruta raíz de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la API de Dux Tuki System' });
    intializeDatabase();
});

// Ruta de ejemplo: listar todas las tablas para verificar la conexión
app.get('/api/tablas', (req, res) => {
    db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res
                    .status(500)
                    .json({ error: 'Error al consultar la base de datos' });
            }
            res.json({
                message: 'Tablas encontradas',
                tablas: rows.map((row) => row.name),
            });
        },
    );
});
// Endpoint para obtener todos los clientes

app.get('/api/clientes', (req, res) => {
    db.all("SELECT * FROM clientes", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


// Endpoint para obtener un cliente en particular por su ID
app.get('/api/clientes/:id',(req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM clientes WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.json(row);
    });
});

// Endpoint para obtener todos los alquileres (opcional)
app.get('/api/alquileres', (req, res) => {
    db.all("SELECT * FROM alquileres", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint para obtener un alquiler en particular por su ID
app.get('/api/alquileres/:id', (req, res) => {
    // 1. Extraemos el id de los parámetros de la URL
    const { id } = req.params;

    // 2. Usamos db.get para traer una sola fila. 
    // Usamos el signo "?" para evitar inyecciones SQL (Binding parameters)
    db.get("SELECT * FROM alquileres WHERE id = ?", [id], (err, row) => {
        if (err) {
            // Si hay un error con la consulta SQL
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            // Si no se encontró ningún alquiler con ese ID
            return res.status(404).json({ message: "Alquiler no encontrado" });
        }

        // 3. Respondemos con el alquiler encontrado
        res.json(row);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
    console.log(`🌍 URL de prueba: http://localhost:${PORT}`);
    console.log(`📊 URL de info BD: http://localhost:${PORT}/api/tablas`);
});

// Manejo del cierre ordenado de la base de datos (Ctrl + C)
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error cerrando la base de datos:', err.message);
        } else {
            console.log('🛑 Conexión a la base de datos cerrada.');
        }
        process.exit(0);
    });
});
