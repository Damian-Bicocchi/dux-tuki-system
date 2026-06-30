// controllers/alquiler.controller.js
const alquilerService = require("../services/alquiler.service");

class AlquilerController {
  async listar(req, res) {
    try {
      const { estado, cliente_id, fecha_inicio, fecha_fin } = req.query;
      const rows = await alquilerService.listarAlquileres({ estado, cliente_id, fecha_inicio, fecha_fin });
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const alquiler = await alquilerService.obtainAlquilerCompleto(req.params.id);
      if (!alquiler) return res.status(404).json({ error: 'Alquiler no encontrado' });
      return res.json(alquiler);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async crear(req, res) {
    try {
      const nuevoAlquiler = await alquilerService.crearAlquiler(req.body);
      return res.status(201).json(nuevoAlquiler);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async actualizar(req, res) {
    try {
      const alquilerActualizado = await alquilerService.actualizarAlquilerCompleto(req.params.id, req.body);
      if (!alquilerActualizado) return res.status(404).json({ error: 'Alquiler no encontrado' });
      return res.json(alquilerActualizado);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async parchearEstado(req, res) {
    try {
      const alquilerModificado = await alquilerService.cambiarEstado(req.params.id, req.body.estado);
      if (!alquilerModificado) return res.status(404).json({ error: 'Alquiler no encontrado' });
      return res.json(alquilerModificado);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const resultado = await alquilerService.eliminarAlquilerSiEsValido(req.params.id);
      if (!resultado.encontrado) return res.status(404).json({ error: 'Alquiler no encontrado' });
      if (!resultado.permitido) {
        return res.status(409).json({ error: 'Solo se pueden eliminar alquileres cancelados o devueltos' });
      }
      return res.json({ message: 'Alquiler eliminado correctamente' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Resuelve el endpoint requerido por el componente StockDetallePage.tsx
  async obtenerAlquileresPorArticulo(req, res) {
    try {
      const historial = await alquilerService.listarAlquileresPorArticulo(req.params.id);
      return res.json(historial);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AlquilerController();