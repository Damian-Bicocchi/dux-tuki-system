const { Router } = require("express");
const stockController = require("../controllers/stock.controller");
const { validarNuevoArticulo } = require("../middlewares/stock.middleware");
const authenticate = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = Router();
router.use(authenticate);

// Accesible desde: GET http://localhost:3001/api/stock
router.get("/", checkPermission('permiso_para_listar_stock'), stockController.obtenerArticulos);

// Accesible desde: POST http://localhost:3001/api/stock
router.post("/", checkPermission('permiso_para_crear_stock'), validarNuevoArticulo, stockController.crearOSumarArticulo);

// 👇 AGREGA ESTA RUTA NUEVA
router.get("/:id", checkPermission('permiso_para_listar_stock'), stockController.obtenerArticuloPorId);

router.put("/:id", checkPermission('permiso_para_editar_stock'), stockController.actualizarArticulo);

module.exports = router;
