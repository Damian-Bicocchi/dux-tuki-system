const express = require('express');
const router = express.Router();

const rolesController = require('../controllers/rolesController');
const checkPermission = require('../middlewares/checkPermission');
// Asumiendo que tienes un middleware para verificar JWT / sesión previa
const authenticate = require('../middlewares/auth'); 

// -------------------------------------------------------------
// RUTAS PARA GESTIONAR ROLES (Solo el Admin puede usarlas)
// -------------------------------------------------------------

// Crear un nuevo rol dinámico
router.post(
  '/', 
  authenticate, 
  checkPermission('users:assign_roles'), // O depende de isAdmin
  rolesController.createRole
);

// Listar todos los roles
router.get(
  '/', 
  authenticate, 
  rolesController.getAllRoles
);

// Asignar rol a un usuario
router.post(
  '/assign', 
  authenticate, 
  checkPermission('users:assign_roles'), 
  rolesController.assignRoleToUser
);

module.exports = router;