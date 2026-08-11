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

  async actualizarArticulo(req, res) {
    try {
        // 1. Extraemos el ID de la URL (ej: /api/stock/5)
        const id = req.params.id;
        
        // 2. Extraemos los datos que mandó el Frontend en el JSON
        const datos = req.body;

        // 3. Llamamos al SERVICE que me pasaste arriba
        const resultado = await stockService.actualizarArticulo(id, datos);

        // 4. Si el service devolvió false (no encontró el artículo)
        if (!resultado) {
            return res.status(404).json({ 
                message: `El artículo con ID ${id} no existe.` 
            });
        }

        // 5. Todo salió bien, respondemos con status 200 y el objeto actualizado
        res.status(200).json(resultado);

    } catch (error) {
        console.error("Error en el controller actualizarArticulo:", error);
        res.status(500).json({ 
            message: "Error interno al actualizar el artículo",
            error: error.message 
        });
    }
}
  async crearOSumarArticulo(req, res, next) {
    try {
      const {
        nombre,
        cantidad,
        categoria,
        precio_por_dia,
        deposito_garantia,
      } = req.body;

      const resultado = await stockService.procesarArticulo(
        nombre,
        cantidad,
        categoria,
        precio_por_dia,
        deposito_garantia
      );
      
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

  // 👇 CORREGIDO: Ahora es un método de clase, usa el Service y mantiene el formato JSON
  async obtenerArticuloPorId(req, res, next) {
    const { id } = req.params;

    try {
      // Llamamos al servicio en lugar de ir directo al repositorio
      const articulo = await stockService.buscarArticuloPorId(id);

      if (!articulo) {
        return res.status(404).json({ 
          status: "error",
          message: `El artículo con ID #${id} no existe en la base de datos.` 
        });
      }

      // Lógica de formateo intermedia requerida por el frontend
      articulo.cantidad_alquilados = articulo.cantidad_alquilados || 0;

      return res.json(articulo);

    } catch (error) {
      console.error(`Error en obtenerArticuloPorId:`, error);
      return res.status(500).json({ 
        status: "error",
        message: "Ocurrió un error interno en el servidor al procesar la solicitud de stock." 
      });
    }
  }
}

module.exports = new StockController();