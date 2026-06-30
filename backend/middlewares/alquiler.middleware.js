// middlewares/alquiler.middleware.js
class AlquilerMiddleware {
  validarEstructuraCrearOEditar(req, res, next) {
    const { cliente_id, fecha_inicio, fecha_fin, items } = req.body;

    if (!cliente_id)   return res.status(400).json({ error: 'cliente_id es obligatorio' });
    if (!fecha_inicio) return res.status(400).json({ error: 'fecha_inicio es obligatoria' });
    if (!fecha_fin)    return res.status(400).json({ error: 'fecha_fin es obligatoria' });
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos un artículo en items' });
    }
    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        return res.status(400).json({ error: 'fecha_fin no puede ser anterior a fecha_inicio' });
    }

    for (const item of items) {
      if (!item.articulo_id || !item.cantidad || item.cantidad < 1) {
          return res.status(400).json({ error: 'Cada item debe tener articulo_id y cantidad >= 1' });
      }
    }

    next();
  }

  validarCambioEstado(req, res, next) {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'activo', 'devuelto', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` });
    }
    next();
  }
}

module.exports = new AlquilerMiddleware();