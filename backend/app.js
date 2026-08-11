const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas (usando los nuevos routers sin inyección manual de db)
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/stock', require('./routes/articulos'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/alquileres', require('./routes/alquileres'));
app.use('/api/costos', require('./routes/costos'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/usuarios', require('./routes/usuarios'));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Dux Tuki System',
    version: '3.0.0',
    endpoints: [
      '/api/categorias',
      '/api/stock',
      '/api/clientes',
      '/api/alquileres',
      '/api/costos',
      '/api/estadisticas',
      '/api/usuarios',
    ],
  });
});

// Middleware de errores (siempre al final)
app.use(errorHandler);

module.exports = app;