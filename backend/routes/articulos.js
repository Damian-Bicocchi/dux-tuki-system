const express = require("express");
const { StockRepository } = require("../repositories/stock.repository.js");
const { StockService } = require("../services/stock.service.js");
const { validateStockInput } = require("../middlewares/stock.middleware.js");

const router = express.Router();

// Dependencias
const stockRepository = require("../repositories/stock.repository");
const stockService = new StockService(stockRepository);

// Obtener todo el stock
router.get("/", async (req, res) => {
  try {
    const items = await stockRepository.getAll();
    console.log(items);
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el stock",
    });
  }
});

// Guardar/actualizar stock
router.post("/", validateStockInput, async (req, res) => {
  try {
    const { nombre, categoria, cantidad } = req.body;

    const resultado = await stockService.procesarIngresoStock(
      nombre,
      categoria,
      cantidad
    );

    res.status(200).json({
      success: true,
      message:
        resultado.operacion === "actualizado"
          ? "Stock actualizado"
          : "Equipo agregado",
      data: resultado.item,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error interno del servidor.",
    });
  }
});

// Verificar duplicados
router.get("/check-duplicado", async (req, res) => {
  try {
    const nombre = req.query.nombre || "";

    const resultado = await stockService.verificarDuplicado(nombre);

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Error al verificar duplicados.",
    });
  }
});

module.exports = router;