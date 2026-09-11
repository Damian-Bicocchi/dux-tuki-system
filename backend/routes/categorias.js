const express = require('express');

const categoriasController = require('../controllers/categorias.controller');
const authenticate = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();
router.use(authenticate);

// Lectura: la necesita cualquiera que pueda ver stock (filtros, alta de artículos) o gestionar categorías
const puedeLeer = checkPermission(['permiso_para_listar_stock', 'permiso_para_gestionar_categorias']);
// Escritura: sólo quien gestiona categorías
const puedeGestionar = checkPermission('permiso_para_gestionar_categorias');

router.get('/', puedeLeer, categoriasController.getAll);
router.get('/:id', puedeLeer, categoriasController.getById);
router.post('/', puedeGestionar, categoriasController.create);
router.put('/:id', puedeGestionar, categoriasController.update);
router.delete('/:id', puedeGestionar, categoriasController.delete);

module.exports = router;
