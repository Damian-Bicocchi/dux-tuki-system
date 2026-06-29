const { Router } = require("express");
const stockController = require("../controllers/stock.controller");
const { validarNuevoArticulo } = require("../middlewares/stock.middleware");

const router = Router();

// Accesible desde: GET http://localhost:3001/api/stock
router.get("/", stockController.obtenerArticulos);

// Accesible desde: POST http://localhost:3001/api/stock
router.post("/", validarNuevoArticulo, stockController.crearOSumarArticulo);

// 👇 AGREGA ESTA RUTA NUEVA
router.get("/:id", stockController.obtenerArticuloPorId);

module.exports = router;