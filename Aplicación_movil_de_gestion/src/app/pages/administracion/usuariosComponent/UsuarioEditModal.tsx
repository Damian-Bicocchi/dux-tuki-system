import { UsuarioForm } from './UsuarioForm';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface UsuarioEditModalProps {
  usuario: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
}

export function UsuarioEditModal({
  usuario,
  isOpen,
  onClose,
  onSave,
}: UsuarioEditModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      aria-labelledby="editar-usuario-title"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2
            id="editar-usuario-title"
            className="text-xl font-bold"
          >
            Editar usuario
          </h2>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <UsuarioForm
          initialValues={{
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
          }}
          submitLabel="Guardar cambios"
          onSubmit={(data) =>
            onSave({
              ...usuario,
              ...data,
            })
          }
        />
      </div>
    </div>
  );
}