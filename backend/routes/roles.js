const express = require('express');
const rolesController = require('../controllers/roles.controller');
const authenticate = require('../middlewares/auth');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

// Todas las rutas de roles requieren un token válido
router.use(authenticate);

// Lectura: cualquier usuario autenticado (por ejemplo, para poblar selectores)
router.get('/permisos', rolesController.getPermisos);
router.get('/', rolesController.getAll);
router.get('/:id', rolesController.getById);

// Escritura: reservada a administradores
router.post('/', requireAdmin, rolesController.create);
router.put('/:id', requireAdmin, rolesController.update);
router.delete('/:id', requireAdmin, rolesController.delete);

module.exports = router;
