const rolesRepository = require('../repositories/roles.repository');

/**
 * Rangos predefinidos del sistema.
 *
 * - Administrador: no es un rol de la tabla, es la bandera `is_admin` del usuario
 *   y tiene todos los permisos siempre.
 * - Encargado: modifica stock, clientes, alquileres, categorías y costos.
 *   No ve estadísticas ni entra a configuraciones avanzadas.
 * - Operador: ve y registra alquileres, y da alta stock nuevo. Los permisos de
 *   lectura de stock y clientes son los mínimos para poder completar esos
 *   formularios. No gestiona categorías.
 *
 * Se crean sólo si no existen (por nombre), así el admin puede editarlos después
 * desde Configuraciones avanzadas sin que se pisen al reiniciar el servidor.
 */
const ROLES_PREDEFINIDOS = [
  {
    nombre: 'Encargado',
    descripcion:
      'Gestiona alquileres, stock, clientes, categorías y costos. Sin acceso a estadísticas ni configuración.',
    permisos: [
      'permiso_para_ver_alquileres',
      'permiso_para_registrar_alquileres',
      'permiso_para_editar_alquileres',
      'permiso_para_cerrar_alquileres',
      'permiso_para_eliminar_alquileres',
      'permiso_para_listar_stock',
      'permiso_para_crear_stock',
      'permiso_para_editar_stock',
      'permiso_para_listar_clientes',
      'permiso_para_registrar_clientes',
      'permiso_para_editar_clientes',
      'permiso_para_gestionar_categorias',
      'permiso_para_gestionar_costos',
    ],
  },
  {
    nombre: 'Operador',
    descripcion: 'Ve y registra alquileres, y da alta stock nuevo.',
    permisos: [
      'permiso_para_ver_alquileres',
      'permiso_para_registrar_alquileres',
      'permiso_para_crear_stock',
      'permiso_para_listar_stock',
      'permiso_para_listar_clientes',
    ],
  },
];

async function seedRoles() {
  for (const rol of ROLES_PREDEFINIDOS) {
    const existente = await rolesRepository.findByName(rol.nombre);
    if (existente) {
      console.log(`ℹ️ El rol "${rol.nombre}" ya existe en la base de datos`);
      continue;
    }
    await rolesRepository.create(rol.nombre, rol.descripcion, rol.permisos);
    console.log(`✅ Rol "${rol.nombre}" creado con éxito`);
  }
}

module.exports = { seedRoles, ROLES_PREDEFINIDOS };
