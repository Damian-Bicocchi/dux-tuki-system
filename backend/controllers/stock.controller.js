const stockService = require("../services/stock.service");

class StockController {
  async obtenerArticulos(req, res, next) {
    try {
      const articulos = await stockService.listarArticulos();
      return res.json(articulos);
    } catch (error) {
      console.error("Error en obtenerArticulos:", error);
      return res.status(500).json({ status: "error", message: "Error al listar los artículos del stock." });
    }
  }

  async obtenerCategorias(req, res, next) {
    try {
      const categorias = await stockService.listarCategorias();
      return res.json(categorias);
    } catch (error) {
      console.error("Error en obtenerCategorias:", error);
      return res.status(500).json({ status: "error", message: "Error al listar las categorías del stock." });
    }
  }

  async crearOSumarArticulo(req, res, next) {
    try {
      const { nombre, cantidad, categoria } = req.body;
      
      const resultado = await stockService.procesarArticulo(nombre, cantidad, categoria);
      
      return res.status(resultado.esDuplicado ? 200 : 201).json({
        status: "success",
        message: resultado.message,
        data: resultado.item
      });
    } catch (error) {
      console.error("Error en crearOSumarArticulo:", error);
      return res.status(500).json({ 
        status: "error", 
        message: "No se pudo procesar el artículo en el servidor debido a un fallo en la base de datos." 
      });
    }
  }
}

module.exports = new StockController();