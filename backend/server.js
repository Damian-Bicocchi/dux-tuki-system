const { connect, closeDb } = require('./db');
const { initializeTables } = require('./db/init');
const { createAdmin } = require('./seeders/admin.seeder');
const app = require('./app');
const { PORT } = require('./config/env');

async function start() {
  try {
    // 1. Conectar a la base de datos
    connect();
    // 2. Crear tablas si no existen
    initializeTables();
    // 3. Sembrar usuario administrador
    await createAdmin();
    // 4. Arrancar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
      console.log(`🌍 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar la aplicación:', err.message);
    process.exit(1);
  }
}

// Manejo de cierre ordenado
process.on('SIGINT', async () => {
  console.log('\n🛑 Señal SIGINT recibida, cerrando servidor...');
  await closeDb();
  process.exit(0);
});

start();