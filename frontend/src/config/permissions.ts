// 1. Tipos estrictos para autocompletado en todo el código
export type PermissionKey =
  | 'permiso_para_registrar_alquileres'
  | 'permiso_para_listar_stock'
  | 'permiso_para_crear_stock'
  | 'permiso_para_editar_stock'
  | 'permiso_para_listar_clientes'
  | 'permiso_para_registrar_clientes'
  | 'permiso_para_gestionar_categorias'
  | 'permiso_para_ver_estadisticas'
  | 'permiso_para_entrar_a_configuraciones_avanzadas'
  | 'permiso_para_modificar_alquileres';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;      // Pregunta o texto amigable para la UI
  category: string;   // Para agrupar en el formulario del Admin
}

// 2. Lista de permisos disponible para renderizar el formulario de creación de roles
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Alquileres
  {
    key: 'permiso_para_registrar_alquileres',
    label: '¿Puede registrar nuevos alquileres?',
    category: 'Alquileres',
  },

  {
    key: 'permiso_para_modificar_alquileres',
    label: '¿Puede modificar alquileres? (marcar como "Entregado" por ejemplo)',
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

  // Sistema
  {
    key: 'permiso_para_entrar_a_configuraciones_avanzadas',
    label: '¿Puede acceder a configuraciones avanzadas?',
    category: 'Sistema',
  },
];