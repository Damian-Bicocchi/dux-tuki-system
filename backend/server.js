const { connect, closeDb } = require('./db');
const { initializeTables } = require('./db/init');
const { createAdmin } = require('./seeders/admin.seeder');
const app = require('./app');
const { PORT } = require('./config/env');

async function start() {
  // Variable para trackear en qué punto del ciclo de vida falló
  let currentStep = 'Inicializando'; 

  try {
    currentStep = '1. Conectar a la base de datos';
    await connect(); // Faltaba await
    
    // 2. Crear tablas si no existen
    currentStep = '2. Crear tablas si no existen (initializeTables)';
    await initializeTables(); // Faltaba await
    
    // 3. Sembrar usuario administrador
    currentStep = '3. Sembrar usuario administrador (createAdmin)';
    await createAdmin();
    
    // 4. Arrancar el servidor HTTP
    currentStep = '4. Arrancar el servidor HTTP (app.listen)';
    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Servidor iniciado con éxito`);
      console.log(`🌍 URL: http://localhost:${PORT}`);
      console.log(`==================================================\n`);
    });

  } catch (err) {
    console.error(`\n❌ [FATAL ERROR] La aplicación se detuvo durante el paso: "${currentStep}"`);
    console.error(`------------------------------------------------------------------`);
    console.error(`📝 Mensaje: ${err.message}`);
    console.error(`📂 Ubicación del error:`);
    // Imprime el stack trace completo para ver el archivo y línea exacta
    console.error(err.stack || err); 
    console.error(`------------------------------------------------------------------\n`);
    
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