// 1. Tipos estrictos para autocompletado en todo el código
export type PermissionKey =
  | 'permiso_para_crear_stock'
  | 'permiso_para_editar_stock'
  | 'permiso_para_entrar_a_configuraciones_avanzadas'
  | 'permiso_para_registrar_alquileres';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;      // Pregunta o texto amigable para la UI
  category: string;   // Para agrupar en el formulario del Admin
}

// 2. Lista de permisos disponible para renderizar el formulario de creación de roles
export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'permiso_para_registrar_alquileres',
    label: '¿Puede este rol registrar nuevos alquileres?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_crear_stock',
    label: '¿Puede este rol crear nuevo stock?',
    category: 'Stock',
  },
  {
    key: 'permiso_para_editar_stock',
    label: '¿Puede este rol editar stock existente?',
    category: 'Stock',
  },
  {
    key: 'permiso_para_entrar_a_configuraciones_avanzadas',
    label: '¿Puede acceder a configuraciones avanzadas?',
    category: 'Sistema',
  },
];