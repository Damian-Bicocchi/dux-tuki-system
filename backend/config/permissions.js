/**
 * Lista canónica de permisos del sistema.
 *
 * Es la única fuente de verdad del backend: cualquier permiso que se asigne a un rol
 * debe existir acá. Las claves deben coincidir con las usadas en los
 * `checkPermission('...')` de las rutas y con `frontend/src/config/permissions.ts`.
 *
 * Regla de oro: un usuario con `is_admin = 1` tiene TODOS los permisos, siempre,
 * sin importar el rol que tenga asignado (ver middlewares/checkPermission.js).
 */
const ALL_PERMISSIONS = [
  // Alquileres
  { key: 'permiso_para_ver_alquileres',        label: '¿Puede ver el listado y el detalle de alquileres?',        category: 'Alquileres' },
  { key: 'permiso_para_registrar_alquileres',  label: '¿Puede registrar nuevos alquileres?',                       category: 'Alquileres' },
  { key: 'permiso_para_editar_alquileres',     label: '¿Puede editar alquileres existentes?',                      category: 'Alquileres' },
  { key: 'permiso_para_cerrar_alquileres',     label: '¿Puede registrar devoluciones y cerrar alquileres?',        category: 'Alquileres' },
  { key: 'permiso_para_eliminar_alquileres',   label: '¿Puede eliminar alquileres?',                               category: 'Alquileres' },

  // Stock
  { key: 'permiso_para_listar_stock',          label: '¿Puede ver el listado de stock?',                           category: 'Stock' },
  { key: 'permiso_para_crear_stock',           label: '¿Puede registrar nuevo stock?',                             category: 'Stock' },
  { key: 'permiso_para_editar_stock',          label: '¿Puede modificar el stock existente?',                      category: 'Stock' },

  // Clientes
  { key: 'permiso_para_listar_clientes',       label: '¿Puede ver el listado de clientes?',                        category: 'Clientes' },
  { key: 'permiso_para_registrar_clientes',    label: '¿Puede registrar nuevos clientes?',                         category: 'Clientes' },
  { key: 'permiso_para_editar_clientes',       label: '¿Puede editar y eliminar clientes?',                        category: 'Clientes' },

  // Categorías
  { key: 'permiso_para_gestionar_categorias',  label: '¿Puede registrar y/o modificar categorías?',                category: 'Categorías' },

  // Costos
  { key: 'permiso_para_gestionar_costos',      label: '¿Puede ver y registrar costos?',                            category: 'Costos' },

  // Estadísticas
  { key: 'permiso_para_ver_estadisticas',      label: '¿Puede visualizar las estadísticas del sistema?',           category: 'Estadísticas' },

  // Sistema
  { key: 'permiso_para_entrar_a_configuraciones_avanzadas', label: '¿Puede acceder a configuraciones avanzadas?', category: 'Sistema' },
];

const PERMISSION_KEYS = ALL_PERMISSIONS.map((p) => p.key);

function isValidPermission(key) {
  return PERMISSION_KEYS.includes(key);
}

module.exports = { ALL_PERMISSIONS, PERMISSION_KEYS, isValidPermission };
