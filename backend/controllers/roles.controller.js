const rolesService = require('../services/roles.service');

// GET /api/roles/permisos - Lista de permisos disponibles para armar el formulario
exports.getPermisos = (req, res) => {
  res.json(rolesService.getPermisosDisponibles());
};

// GET /api/roles - Listar todos los roles
exports.getAll = async (req, res, next) => {
  try {
    const roles = await rolesService.getAll();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// GET /api/roles/:id - Obtener un rol
exports.getById = async (req, res, next) => {
  try {
    const rol = await rolesService.getById(parseInt(req.params.id, 10));
    res.json(rol);
  } catch (err) {
    next(err);
  }
};

// POST /api/roles - Crear un rol dinámico
exports.create = async (req, res, next) => {
  try {
    const { nombre, descripcion, permisos } = req.body;
    const nuevoRol = await rolesService.create({ nombre, descripcion, permisos });
    res.status(201).json(nuevoRol);
  } catch (err) {
    next(err);
  }
};

// PUT /api/roles/:id - Editar nombre/descripcion/permisos de un rol
exports.update = async (req, res, next) => {
  try {
    const { nombre, descripcion, permisos } = req.body;
    const rolActualizado = await rolesService.update(parseInt(req.params.id, 10), {
      nombre,
      descripcion,
      permisos,
    });
    res.json(rolActualizado);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/roles/:id - Eliminar un rol (sólo si ningún usuario lo tiene asignado)
exports.delete = async (req, res, next) => {
  try {
    const resultado = await rolesService.delete(parseInt(req.params.id, 10));
    res.json(resultado);
  } catch (err) {
    next(err);
  }
};
