import { useState } from "react";
import { UsuariosList } from "../usuariosComponent/UsuarioList";
import { UsuarioEditModal } from "../usuariosComponent/UsuarioEditModal";
import { UsuarioForm } from "../usuariosComponent/UsuarioForm";
import { SuccessModal } from "../../../components/SuccessModal";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@empresa.com",
      rol: "Administrador",
    },
    {
      id: 2,
      nombre: "María Gómez",
      email: "maria@empresa.com",
      rol: "Administrador",
    },
  ]);

  const [selectedUser, setSelectedUser] =
    useState<Usuario | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    title: string;
    message?: string;
  } | null>(null);

  const handleCrearUsuario = (
    nuevoUsuario: Omit<Usuario, "id">,
  ) => {
    const usuario: Usuario = {
      id: Date.now(),
      ...nuevoUsuario,
    };

    setUsuarios((prev) => [...prev, usuario]);
    setSuccessModal({
      title: "¡Usuario creado con éxito!",
      message: `El usuario ${nuevoUsuario.email} fue registrado correctamente.`,
    });
  };

  const handleEditarUsuario = (usuarioId: number) => {
    const usuario = usuarios.find(
      (usuario) => usuario.id === usuarioId,
    );

    if (!usuario) return;

    setSelectedUser(usuario);
    setIsEditModalOpen(true);
  };

  const handleGuardarUsuario = (
    usuarioActualizado: Usuario,
  ) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioActualizado.id
          ? usuarioActualizado
          : usuario,
      ),
    );

    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSuccessModal({
      title: "¡Cambios guardados!",
      message: `Los datos de ${usuarioActualizado.email} fueron actualizados correctamente.`,
    });
  };

  const handleCerrarModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-bold text-gray-900">
          Administrar usuarios
        </h2>

        <p className="text-gray-600 mt-1">
          Gestión de usuarios registrados en el sistema.
        </p>
      </header>

      <section
        className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
        aria-labelledby="crear-usuario-title"
      >
        <h3
          id="crear-usuario-title"
          className="text-lg font-semibold mb-4"
        >
          Registrar nuevo usuario
        </h3>

        <UsuarioForm
          submitLabel="Crear usuario"
          onSubmit={handleCrearUsuario}
        />
      </section>

      <section aria-labelledby="usuarios-registrados-title">
        <h3
          id="usuarios-registrados-title"
          className="text-lg font-semibold mb-4"
        >
          Usuarios registrados
        </h3>

        <UsuariosList
          usuarios={usuarios}
          onEditar={handleEditarUsuario}
        />
      </section>

      {selectedUser && (
        <UsuarioEditModal
          usuario={selectedUser}
          isOpen={isEditModalOpen}
          onClose={handleCerrarModal}
          onSave={handleGuardarUsuario}
        />
      )}

      <SuccessModal
        isOpen={!!successModal}
        title={successModal?.title ?? ""}
        message={successModal?.message}
        onClose={() => setSuccessModal(null)}
      />
    </div>
  );
}