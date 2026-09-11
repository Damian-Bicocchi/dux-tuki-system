import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Role } from '../../../data/rolesData';
import type { AsignarRolInput, Usuario } from '../../../data/usuariosData';

interface UsuarioEditModalProps {
  usuario: Usuario;
  roles: Role[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: AsignarRolInput) => Promise<void>;
}

// Valor especial del <select>: el Administrador no es un rol de la tabla,
// es la bandera `is_admin` del usuario.
const VALOR_ADMIN = 'admin';

export function UsuarioEditModal({
  usuario,
  roles,
  isOpen,
  onClose,
  onSave,
}: UsuarioEditModalProps) {
  const [rolSeleccionado, setRolSeleccionado] = useState(
    usuario.is_admin ? VALOR_ADMIN : String(usuario.role_id ?? ''),
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const esAdmin = rolSeleccionado === VALOR_ADMIN;

    setError('');
    setIsSaving(true);
    try {
      await onSave(usuario.id, {
        is_admin: esAdmin,
        role_id: esAdmin || !rolSeleccionado ? null : Number(rolSeleccionado),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      aria-labelledby="editar-usuario-title"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            id="editar-usuario-title"
            className="text-xl font-bold"
          >
            Cambiar rol de usuario
          </h2>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Usuario: <span className="font-semibold text-gray-900">{usuario.username}</span>
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="rol-edit" className="block font-medium mb-2">
              Rol
            </label>
            <select
              id="rol-edit"
              value={rolSeleccionado}
              onChange={(e) => setRolSeleccionado(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-[#218a72]/20 focus:border-[#218a72]"
            >
              <option value={VALOR_ADMIN}>Administrador</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              aria-busy={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#218a72] hover:bg-[#1b6f5c] text-white font-bold text-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-[#218a72]/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
