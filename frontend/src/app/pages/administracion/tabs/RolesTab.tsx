import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Lock,
  CheckSquare,
  Square,
  ShieldCheck,
  Users,
  Search
} from 'lucide-react';

// ============================================================================
// 1. Tipos y Constantes de Permisos
// ============================================================================
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
  label: string;
  category: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Alquileres
  {
    key: 'permiso_para_registrar_alquileres',
    label: '¿Puede registrar nuevos alquileres?',
    category: 'Alquileres',
  },
  {
    key: 'permiso_para_modificar_alquileres',
    label: '¿Puede modificar alquileres? (ej. marcar como "Entregado")',
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

// ============================================================================
// 2. Modelo de Rol & Datos Mock
// ============================================================================
export interface Role {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: PermissionKey[];
  esPredeterminado?: boolean;
}

const ROLES_INICIALES: Role[] = [
  {
    id: '1',
    nombre: 'Administrador',
    descripcion: 'Acceso total y control ilimitado del sistema.',
    permisos: ALL_PERMISSIONS.map((p) => p.key),
    esPredeterminado: true,
  },
  {
    id: '2',
    nombre: 'Vendedor / Mostrador',
    descripcion: 'Gestión diaria de alquileres y atención al cliente.',
    permisos: [
      'permiso_para_registrar_alquileres',
      'permiso_para_modificar_alquileres',
      'permiso_para_listar_stock',
      'permiso_para_listar_clientes',
      'permiso_para_registrar_clientes',
    ],
  },
  {
    id: '3',
    nombre: 'Encargado de Depósito',
    descripcion: 'Gestión y modificación del inventario de equipos.',
    permisos: [
      'permiso_para_listar_stock',
      'permiso_para_crear_stock',
      'permiso_para_editar_stock',
      'permiso_para_gestionar_categorias',
    ],
  },
];

// ============================================================================
// 3. Componente Principal Accesible RolesTab
// ============================================================================
export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>(ROLES_INICIALES);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [formError, setFormError] = useState('');

  // Ref para gestión de foco accesible
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFormOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isFormOpen]);

  // Agrupar los permisos disponibles por categoría
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDefinition[]> = {};
    ALL_PERMISSIONS.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, []);

  const handleOpenCreate = () => {
    setEditingRoleId(null);
    setFormNombre('');
    setFormDescripcion('');
    setSelectedPermissions([]);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRoleId(role.id);
    setFormNombre(role.nombre);
    setFormDescripcion(role.descripcion);
    setSelectedPermissions([...role.permisos]);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRoleId(null);
    setFormNombre('');
    setFormDescripcion('');
    setSelectedPermissions([]);
    setFormError('');
  };

  const togglePermission = (key: PermissionKey) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleCategory = (categoryKeys: PermissionKey[]) => {
    const allSelected = categoryKeys.every((key) => selectedPermissions.includes(key));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !categoryKeys.includes(k)));
    } else {
      const merged = new Set([...selectedPermissions, ...categoryKeys]);
      setSelectedPermissions(Array.from(merged));
    }
  };

  const toggleAll = () => {
    if (selectedPermissions.length === ALL_PERMISSIONS.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.key));
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombre.trim()) {
      setFormError('El nombre del rol es obligatorio.');
      return;
    }

    if (editingRoleId) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingRoleId
            ? {
                ...r,
                nombre: formNombre.trim(),
                descripcion: formDescripcion.trim(),
                permisos: selectedPermissions,
              }
            : r
        )
      );
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        nombre: formNombre.trim(),
        descripcion: formDescripcion.trim(),
        permisos: selectedPermissions,
      };
      setRoles((prev) => [...prev, newRole]);
    }

    handleCloseForm();
  };

  const handleDeleteRole = (role: Role) => {
    if (confirm(`¿Estás seguro de que querés eliminar el rol "${role.nombre}"?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Región de anuncios para Lectores de Pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredRoles.length === 1
          ? 'Se encontró 1 rol.'
          : `Se encontraron ${filteredRoles.length} roles.`}
      </div>

      {/* Encabezado Principal */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-[#218a72]" size={26} aria-hidden="true" />
            Roles y Permisos
          </h2>
          <p className="text-gray-600 mt-1 text-sm">
            Creá y administrá los perfiles de acceso para los usuarios de tu equipo.
          </p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-[#218a72] hover:bg-[#1b6f5c] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/40 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={20} aria-hidden="true" />
            <span>Crear Nuevo Rol</span>
          </button>
        )}
      </header>

      {/* =========================================================================
          FORMULARIO ACCESIBLE DE CREACIÓN / EDICIÓN
         ========================================================================= */}
      {isFormOpen && (
        <section
          aria-labelledby="form-role-title"
          className="bg-white border-2 border-[#218a72]/30 rounded-2xl p-6 shadow-md space-y-6"
        >
          <form onSubmit={handleSaveRole} noValidate className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 id="form-role-title" className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="text-[#218a72]" size={22} aria-hidden="true" />
                {editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h3>
              <button
                type="button"
                onClick={handleCloseForm}
                aria-label="Cerrar formulario"
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#218a72] transition-colors"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Alerta de Error Accesible */}
            {formError && (
              <div
                id="form-error-msg"
                role="alert"
                className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl"
              >
                {formError}
              </div>
            )}

            {/* Campos de texto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role-name-input" className="block text-sm font-bold text-gray-700 mb-1">
                  Nombre del Rol <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  id="role-name-input"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={!!formError}
                  aria-describedby={formError ? 'form-error-msg' : undefined}
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="ej. Supervisor, Auditor, Técnico..."
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/20 focus-visible:border-[#218a72] text-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="role-desc-input" className="block text-sm font-bold text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  id="role-desc-input"
                  type="text"
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Breve explicación de las responsabilidades"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/20 focus-visible:border-[#218a72] text-sm text-gray-900"
                />
              </div>
            </div>

            {/* Sección de Permisos agrupados por Fieldsets */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="font-bold text-gray-900" id="permissions-heading">
                    Asignación de Permisos
                  </h4>
                  <p className="text-xs text-gray-600">
                    Seleccioná qué acciones podrá realizar este rol ({selectedPermissions.length} de{' '}
                    {ALL_PERMISSIONS.length} seleccionados)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs font-bold text-[#218a72] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#218a72] rounded px-1 self-start sm:self-auto"
                >
                  {selectedPermissions.length === ALL_PERMISSIONS.length
                    ? 'Deseleccionar todos'
                    : 'Seleccionar todos los permisos'}
                </button>
              </div>

              <div className="space-y-4" aria-labelledby="permissions-heading">
                {Object.entries(groupedPermissions).map(([category, permList]) => {
                  const categoryKeys = permList.map((p) => p.key);
                  const allCatSelected = categoryKeys.every((k) => selectedPermissions.includes(k));

                  return (
                    <fieldset
                      key={category}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/60"
                    >
                      <legend className="px-2 font-bold text-xs text-gray-800 uppercase tracking-wider bg-white border border-gray-200 rounded-md py-0.5">
                        {category} ({permList.filter((p) => selectedPermissions.includes(p.key)).length} / {permList.length})
                      </legend>

                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={() => toggleCategory(categoryKeys)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#218a72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#218a72] rounded px-1.5 py-0.5"
                        >
                          {allCatSelected ? (
                            <>
                              <CheckSquare size={16} className="text-[#218a72]" aria-hidden="true" />
                              <span>Deseleccionar categoría</span>
                            </>
                          ) : (
                            <>
                              <Square size={16} aria-hidden="true" />
                              <span>Marcar toda la categoría</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Lista de Checkboxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permList.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.key);
                          const inputId = `perm-checkbox-${perm.key}`;

                          return (
                            <label
                              key={perm.key}
                              htmlFor={inputId}
                              className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer select-none transition-all focus-within:ring-2 focus-within:ring-[#218a72] focus-within:ring-offset-1 ${
                                isChecked
                                  ? 'bg-white border-[#218a72] text-gray-900 shadow-sm'
                                  : 'bg-white/80 border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <input
                                id={inputId}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="sr-only"
                              />
                              <div
                                aria-hidden="true"
                                className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isChecked
                                    ? 'bg-[#218a72] text-white'
                                    : 'border-2 border-gray-400 bg-white'
                                }`}
                              >
                                {isChecked && <Check size={14} strokeWidth={3} />}
                              </div>
                              <span className="text-xs font-medium leading-tight">
                                {perm.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </div>

            {/* Acciones del Formulario */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#218a72] hover:bg-[#1b6f5c] text-white font-bold text-sm rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/30 transition-all shadow-sm active:scale-[0.98]"
              >
                <Check size={18} aria-hidden="true" />
                <span>{editingRoleId ? 'Guardar Cambios' : 'Crear Rol'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* =========================================================================
          LISTADO DE ROLES EXISTENTES
         ========================================================================= */}
      <section aria-labelledby="roles-list-title" className="space-y-4">
        <h3 id="roles-list-title" className="sr-only">
          Listado de roles configurados
        </h3>

        {/* Buscador accesibilidad */}
        <div className="relative max-w-md">
          <label htmlFor="search-roles-input" className="sr-only">
            Buscar roles por nombre o descripción
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
          <input
            id="search-roles-input"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/20 focus-visible:border-[#218a72] text-sm bg-white text-gray-900"
          />
        </div>

        {/* Grilla de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => {
            const numPerms = role.permisos.length;
            const totalPerms = ALL_PERMISSIONS.length;
            const pct = Math.round((numPerms / totalPerms) * 100);

            return (
              <article
                key={role.id}
                className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72]/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-[#218a72]/10 rounded-xl flex items-center justify-center text-[#218a72] flex-shrink-0">
                        {role.esPredeterminado ? (
                          <Lock size={18} aria-label="Rol protegido de sistema" />
                        ) : (
                          <Users size={18} aria-hidden="true" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-snug">
                          {role.nombre}
                        </h4>
                        {role.esPredeterminado && (
                          <span className="inline-block px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                            Sistema
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acciones por tarjeta */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(role)}
                        aria-label={`Editar rol ${role.nombre}`}
                        className="p-1.5 text-gray-600 hover:text-[#218a72] hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#218a72] rounded-lg transition-colors"
                      >
                        <Edit3 size={16} aria-hidden="true" />
                      </button>
                      {!role.esPredeterminado && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          aria-label={`Eliminar rol ${role.nombre}`}
                          className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-4 min-h-[32px] line-clamp-2">
                    {role.descripcion || 'Sin descripción asignada.'}
                  </p>

                  {/* Cobertura de permisos */}
                  <div className="space-y-1.5 mb-4" aria-label={`Cobertura de permisos: ${numPerms} de ${totalPerms}`}>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">Permisos asignados:</span>
                      <span className="text-[#218a72]">{numPerms} de {totalPerms} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden" aria-hidden="true">
                      <div
                        className="bg-[#218a72] h-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumen por Categorías */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1" aria-label="Resumen por categoría">
                  {Object.keys(groupedPermissions).map((category) => {
                    const catKeys = groupedPermissions[category].map((p) => p.key);
                    const activeCount = catKeys.filter((k) => role.permisos.includes(k)).length;
                    if (activeCount === 0) return null;

                    return (
                      <span
                        key={category}
                        className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[11px] font-medium rounded-md"
                      >
                        {category}: {activeCount}
                      </span>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {filteredRoles.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-600 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              No se encontraron roles que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}