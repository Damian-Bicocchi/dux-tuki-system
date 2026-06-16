function errorHandler(err, req, res, next) {
  console.error('❌ Error no manejado:', err.message);
  // Si el error tiene un código de estado personalizado (ej: 404, 409) lo usamos
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;