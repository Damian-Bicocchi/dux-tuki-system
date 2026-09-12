const rolesRepository = require('../repositories/roles.repository');
const { ALL_PERMISSIONS, isValidPermission } = require('../config/permissions');

// Nombre reservado: el administrador no es un rol de la tabla, es la bandera is_admin.
const NOMBRE_RESERVADO = 'administrador';

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Normaliza y valida los datos de un rol antes de persistirlos.
 * Devuelve { nombre, descripcion, permisos } listos para guardar.
 */
function validarDatosRol({ nombre, descripcion, permisos }) {
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw httpError('El nombre del rol es obligatorio', 400);
  }

  const nombreLimpio = nombre.trim();

  if (nombreLimpio.length > 50) {
    throw httpError('El nombre del rol no puede superar los 50 caracteres', 400);
  }

  if (nombreLimpio.toLowerCase() === NOMBRE_RESERVADO) {
    throw httpError(
      'El nombre "Administrador" está reservado para el usuario administrador del sistema',
      400
    );
  }

  if (permisos === undefined || permisos === null) {
    permisos = [];
  }

  if (!Array.isArray(permisos)) {
    throw httpError('Los permisos deben enviarse como un arreglo de claves', 400);
  }

  const invalidos = permisos.filter((p) => typeof p !== 'string' || !isValidPermission(p));
  if (invalidos.length > 0) {
    throw httpError(`Permisos inválidos: ${invalidos.join(', ')}`, 400);
  }

  // Sin duplicados y en el orden canónico de la lista de permisos
  const set = new Set(permisos);
  const permisosOrdenados = ALL_PERMISSIONS.map((p) => p.key).filter((k) => set.has(k));

  const descripcionLimpia =
    typeof descripcion === 'string' ? descripcion.trim().slice(0, 200) : '';

  return { nombre: nombreLimpio, descripcion: descripcionLimpia, permisos: permisosOrdenados };
}

class RolesService {
  getPermisosDisponibles() {
    return ALL_PERMISSIONS;
  }

  async getAll() {
    return await rolesRepository.findAll();
  }

  async getById(id) {
    const rol = await rolesRepository.findById(id);
    if (!rol) throw httpError('Rol no encontrado', 404);
    return rol;
  }

  async create(datos) {
    const { nombre, descripcion, permisos } = validarDatosRol(datos);

    const existente = await rolesRepository.findByName(nombre);
    if (existente) throw httpError('Ya existe un rol con ese nombre', 409);

    try {
      const { id } = await rolesRepository.create(nombre, descripcion, permisos);
      return await this.getById(id);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        throw httpError('Ya existe un rol con ese nombre', 409);
      }
      throw err;
    }
  }

  async update(id, datos) {
    const { nombre, descripcion, permisos } = validarDatosRol(datos);

    const existente = await rolesRepository.findByName(nombre);
    if (existente && existente.id !== id) {
      throw httpError('Ya existe otro rol con ese nombre', 409);
    }

    try {
      const { changes } = await rolesRepository.update(id, nombre, descripcion, permisos);
      if (changes === 0) throw httpError('Rol no encontrado', 404);
      return await this.getById(id);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        throw httpError('Ya existe otro rol con ese nombre', 409);
      }
      throw err;
    }
  }

  async delete(id) {
    const usuariosAsignados = await rolesRepository.countUsuarios(id);
    if (usuariosAsignados > 0) {
      throw httpError(
        `No se puede eliminar el rol: hay ${usuariosAsignados} usuario(s) que lo tienen asignado`,
        409
      );
    }

    const { changes } = await rolesRepository.delete(id);
    if (changes === 0) throw httpError('Rol no encontrado', 404);
    return { message: 'Rol eliminado correctamente' };
  }
}

module.exports = new RolesService();
