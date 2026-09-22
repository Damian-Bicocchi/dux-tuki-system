import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import {
  ALL_PERMISSIONS,
  type PermissionKey,
  type PermissionDefinition,
} from '../../../../config/permissions';
import {
  type Role,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../../../data/rolesData';
import { SuccessModal } from '../../../components/SuccessModal';
import { FailureModal } from '../../../components/FailureModal';

// ============================================================================
// Rol "Administrador": no vive en la base de datos, es la bandera `is_admin`
// del usuario. Se muestra como tarjeta informativa y bloqueada porque, pase
// lo que pase, un administrador tiene todos los permisos.
// ============================================================================
const ADMIN_ROLE: Role = {
  id: 0,
  nombre: 'Administrador',
  descripcion: 'Acceso total y control ilimitado del sistema. No se puede editar ni eliminar.',
  permisos: ALL_PERMISSIONS.map((p) => p.key),
};

interface ModalState {
  title: string;
  message?: string;
}

// ============================================================================
// Componente Principal Accesible RolesTab
// ============================================================================
export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del Formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionKey[]>([]);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  // Feedback al usuario
  const [successModal, setSuccessModal] = useState<ModalState | null>(null);
  const [failureModal, setFailureModal] = useState<ModalState | null>(null);

  // Ref para gestión de foco accesible
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFormOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isFormOpen]);

  // ---------------------------------------------------------------------------
  // Carga de roles desde el backend
  // ---------------------------------------------------------------------------
  const cargarRoles = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'No se pudieron cargar los roles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRoles();
  }, [cargarRoles]);

  // Agrupar los permisos disponibles por categoría
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionDefinition[]> = {};
    ALL_PERMISSIONS.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers del formulario
  // ---------------------------------------------------------------------------
  const resetForm = () => {
    setEditingRoleId(null);
    setFormNombre('');
    setFormDescripcion('');
    setSelectedPermissions([]);
    setFormError('');
  };

  const handleOpenCreate = () => {
    resetForm();
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
    resetForm();
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

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombre = formNombre.trim();
    if (!nombre) {
      setFormError('El nombre del rol es obligatorio.');
      return;
    }

    if (nombre.toLowerCase() === ADMIN_ROLE.nombre.toLowerCase()) {
      setFormError('El nombre "Administrador" está reservado para el administrador del sistema.');
      return;
    }

    const input = {
      nombre,
      descripcion: formDescripcion.trim(),
      permisos: selectedPermissions,
    };

    setIsSaving(true);
    setFormError('');
    try {
      if (editingRoleId !== null) {
        const actualizado = await updateRole(editingRoleId, input);
        setRoles((prev) => prev.map((r) => (r.id === actualizado.id ? actualizado : r)));
        setSuccessModal({
          title: '¡Cambios guardados!',
          message: `El rol "${actualizado.nombre}" fue actualizado correctamente.`,
        });
      } else {
        const creado = await createRole(input);
        setRoles((prev) => [...prev, creado]);
        setSuccessModal({
          title: '¡Rol creado con éxito!',
          message: `El rol "${creado.nombre}" ya está disponible para asignar a usuarios.`,
        });
      }
      handleCloseForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el rol.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`¿Estás seguro de que querés eliminar el rol "${role.nombre}"?`)) return;

    setDeletingRoleId(role.id);
    try {
      await deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      if (editingRoleId === role.id) handleCloseForm();
      setSuccessModal({
        title: 'Rol eliminado',
        message: `El rol "${role.nombre}" fue eliminado correctamente.`,
      });
    } catch (err) {
      setFailureModal({
        title: 'No se pudo eliminar el rol',
        message: err instanceof Error ? err.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setDeletingRoleId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Listado: el Administrador siempre primero, luego los roles de la BD
  // ---------------------------------------------------------------------------
  const term = searchTerm.toLowerCase();
  const filteredRoles = [ADMIN_ROLE, ...roles].filter(
    (r) =>
      r.nombre.toLowerCase().includes(term) ||
      (r.descripcion ?? '').toLowerCase().includes(term)
  );

  return (
    <div className="space-y-6">
      {/* Región de anuncios para Lectores de Pantalla */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isLoading
          ? 'Cargando roles.'
          : filteredRoles.length === 1
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
                {editingRoleId !== null ? 'Editar Rol' : 'Crear Nuevo Rol'}
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
                  maxLength={50}
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
                  maxLength={200}
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

                      {/* Lista de Checkboxes: cada permiso es una pregunta Sí / No */}
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
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault(); // Evita que se envíe el formulario
                                    togglePermission(perm.key); // Alterna el estado del permiso
                                  }
                                }}
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
                              <span className="text-xs font-medium leading-tight flex-1">
                                {perm.label}
                              </span>
                              <span
                                aria-hidden="true"
                                className={`text-[11px] font-bold uppercase flex-shrink-0 ${
                                  isChecked ? 'text-[#218a72]' : 'text-gray-400'
                                }`}
                              >
                                {isChecked ? 'Sí' : 'No'}
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
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                aria-busy={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#218a72] hover:bg-[#1b6f5c] text-white font-bold text-sm rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#218a72]/30 transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Check size={18} aria-hidden="true" />
                )}
                <span>
                  {isSaving
                    ? 'Guardando...'
                    : editingRoleId !== null
                      ? 'Guardar Cambios'
                      : 'Crear Rol'}
                </span>
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

        {/* Error de carga */}
        {loadError && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={cargarRoles}
              className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-red-800 bg-white border border-red-300 rounded-lg hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-600 text-sm py-8 justify-center">
            <Loader2 size={20} className="animate-spin text-[#218a72]" aria-hidden="true" />
            Cargando roles...
          </div>
        )}

        {/* Grilla de Tarjetas */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => {
              const esAdmin = role.id === ADMIN_ROLE.id;
              const numPerms = role.permisos.length;
              const totalPerms = ALL_PERMISSIONS.length;
              const pct = Math.round((numPerms / totalPerms) * 100);
              const isDeleting = deletingRoleId === role.id;

              return (
                <article
                  key={role.id}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-[#218a72]/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-[#218a72]/10 rounded-xl flex items-center justify-center text-[#218a72] flex-shrink-0">
                          {esAdmin ? (
                            <Lock size={18} aria-label="Rol protegido de sistema" />
                          ) : (
                            <Users size={18} aria-hidden="true" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-snug">
                            {role.nombre}
                          </h4>
                          {esAdmin && (
                            <span className="inline-block px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded-md">
                              Sistema
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones por tarjeta (el Administrador no se edita ni se elimina) */}
                      {!esAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(role)}
                            disabled={isDeleting}
                            aria-label={`Editar rol ${role.nombre}`}
                            className="p-1.5 text-gray-600 hover:text-[#218a72] hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#218a72] rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(role)}
                            disabled={isDeleting}
                            aria-busy={isDeleting}
                            aria-label={`Eliminar rol ${role.nombre}`}
                            className="p-1.5 text-gray-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 size={16} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      )}
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
                    {numPerms === 0 && (
                      <span className="text-[11px] text-gray-500 italic">Sin permisos asignados</span>
                    )}
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
        )}
      </section>

      <SuccessModal
        isOpen={!!successModal}
        title={successModal?.title ?? ''}
        message={successModal?.message}
        onClose={() => setSuccessModal(null)}
      />

      <FailureModal
        isOpen={!!failureModal}
        title={failureModal?.title ?? ''}
        message={failureModal?.message}
        onClose={() => setFailureModal(null)}
      />
    </div>
  );
}
