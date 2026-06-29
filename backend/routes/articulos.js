const { Router } = require("express");
const stockController = require("../controllers/stock.controller");
const { validarNuevoArticulo } = require("../middlewares/stock.middleware");

const router = Router();

// Accesible desde: GET http://localhost:3001/api/stock
router.get("/", stockController.obtenerArticulos);

// Accesible desde: POST http://localhost:3001/api/stock
router.post("/", validarNuevoArticulo, stockController.crearOSumarArticulo);

// Nota: podés dejar esta ruta por si querés consultar /api/stock/categorias,
// pero el frontend ya consume directamente /api/categorias a través del otro router.
router.get("/categorias", stockController.obtenerCategorias);

module.exports = router;