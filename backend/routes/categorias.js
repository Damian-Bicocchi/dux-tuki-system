const express = require('express');

const categoriasController = require('../controllers/categorias.controller');
const authenticate = require('../middlewares/auth');
const checkPermission = require('../middlewares/checkPermission');

const router = express.Router();
router.use(authenticate);

router.get('/', categoriasController.getAll);
router.get('/:id', categoriasController.getById);
router.post('/', categoriasController.create);
router.put('/:id', categoriasController.update);
router.delete('/:id', categoriasController.delete);

module.exports = router;