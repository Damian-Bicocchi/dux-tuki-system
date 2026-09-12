import type { Usuario } from '../../../data/usuariosData';

interface UsuariosListProps {
  usuarios: Usuario[];
  currentUserId?: number;
  onEditar: (usuario: Usuario) => void;
}

function formatFecha(fecha?: string) {
  if (!fecha) return '—';
  const [soloFecha] = fecha.split(' ');
  const partes = soloFecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
}

export function UsuariosList({
  usuarios,
  currentUserId,
  onEditar,
}: UsuariosListProps) {
  if (usuarios.length === 0) {
    return (
      <div className="py-10 text-center text-gray-600 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        No hay usuarios registrados todavía.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">Correo</th>
            <th className="text-left py-3 px-4">Rol</th>
            <th className="text-left py-3 px-4">Creado</th>
            <th className="text-right py-3 px-4">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((usuario) => {
            const esUsuarioActual = usuario.id === currentUserId;

            return (
              <tr
                key={usuario.id}
                className="border-b border-gray-100"
              >
                <td className="py-3 px-4">
                  {usuario.username}
                </td>

                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${
                      usuario.is_admin
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {usuario.is_admin ? 'Administrador' : usuario.role_name || 'Sin rol asignado'}
                  </span>
                </td>

                <td className="py-3 px-4 text-sm text-gray-600">
                  {formatFecha(usuario.created_at)}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEditar(usuario)}
                    disabled={esUsuarioActual}
                    title={esUsuarioActual ? 'No podés cambiar tu propio rol' : undefined}
                    aria-label={`Cambiar rol de ${usuario.username}`}
                    className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                  >
                    Cambiar rol
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
