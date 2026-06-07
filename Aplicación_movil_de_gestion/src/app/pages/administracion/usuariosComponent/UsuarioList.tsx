interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface UsuariosListProps {
  usuarios: Usuario[];
  onEditar: (usuarioId: number) => void;
}

export function UsuariosList({
  usuarios,
  onEditar,
}: UsuariosListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">Nombre</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Rol</th>
            <th className="text-right py-3 px-4">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map(usuario => (
            <tr
              key={usuario.id}
              className="border-b border-gray-100"
            >
              <td className="py-3 px-4">
                {usuario.nombre}
              </td>

              <td className="py-3 px-4">
                {usuario.email}
              </td>

              <td className="py-3 px-4">
                {usuario.rol}
              </td>

              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onEditar(usuario.id)}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}