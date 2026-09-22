// 1. Tipos estrictos para autocompletado en todo el código.
//    Esta lista debe coincidir con `backend/config/permissions.js`, que es la que
//    valida el backend al crear o editar un rol y la que exigen las rutas.
export type PermissionKey =
  // Alquileres
  | 'permiso_para_ver_alquileres'
  | 'permiso_para_registrar_alquileres'
  | 'permiso_para_editar_alquileres'
  | 'permiso_para_cerrar_alquileres'
  | 'permiso_para_eliminar_alquileres'
  // Stock
  | 'permiso_para_listar_stock'
  | 'permiso_para_crear_stock'
  | 'permiso_para_editar_stock'
  // Clientes
  | 'permiso_para_listar_clientes'
  | 'permiso_para_registrar_clientes'
  | 'permiso_para_editar_clientes'
  // Categorías
  | 'permiso_para_gestionar_categorias'
  // Estadísticas
  | 'permiso_para_ver_estadisticas'


export interface PermissionDefinition {
  key: PermissionKey;
  label: string;      // Pregunta o texto amigable para la UI
  category: string;   // Para agrupar en el formulario del Admin
}

// 2. Lista de permisos disponible para renderizar el formulario de creación de roles
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Alquileres
  {
    key: 'permiso_para_ver_alquileres',
    label: '¿Puede ver el listado y el detalle de alquileres?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_registrar_alquileres',
    label: '¿Puede registrar nuevos alquileres?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_editar_alquileres',
    label: '¿Puede editar alquileres existentes?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_cerrar_alquileres',
    label: '¿Puede registrar devoluciones y cerrar alquileres?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_eliminar_alquileres',
    label: '¿Puede eliminar alquileres?',
    category: 'Alquileres',
  },

  // Stock
  {
    key: 'permiso_para_listar_stock',
    label: '¿Puede ver el listado de stock?',
    category: 'Stock',
  },
  {
    key: 'permiso_para_crear_stock',
    label: '¿Puede registrar nuevo stock?',
    category: 'Stock',
  },
  {
    key: 'permiso_para_editar_stock',
    label: '¿Puede modificar el stock existente?',
    category: 'Stock',
  },

  // Clientes
  {
    key: 'permiso_para_listar_clientes',
    label: '¿Puede ver el listado de clientes?',
    category: 'Clientes',
  },
  {
    key: 'permiso_para_registrar_clientes',
    label: '¿Puede registrar nuevos clientes?',
    category: 'Clientes',
  },
  {
    key: 'permiso_para_editar_clientes',
    label: '¿Puede editar y eliminar clientes?',
    category: 'Clientes',
  },

  // Categorías
  {
    key: 'permiso_para_gestionar_categorias',
    label: '¿Puede registrar y/o modificar categorías?',
    category: 'Categorías',
  },


  // Reportes / Estadísticas
  {
    key: 'permiso_para_ver_estadisticas',
    label: '¿Puede visualizar las estadísticas del sistema?',
    category: 'Estadísticas',
  },

];
