import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { UsuariosList } from "../usuariosComponent/UsuarioList";
import { UsuarioEditModal } from "../usuariosComponent/UsuarioEditModal";
import { UsuarioForm } from "../usuariosComponent/UsuarioForm";
import { SuccessModal } from "../../../components/SuccessModal";
import { useAuth } from "../../../context/AuthContext";
import { getRoles, type Role } from "../../../data/rolesData";
import {
  getUsuarios,
  crearUsuario,
  asignarRol,
  type Usuario,
  type AsignarRolInput,
  type CrearUsuarioInput,
} from "../../../data/usuariosData";

interface ModalState {
  title: string;
  message?: string;
}

export function UsuariosTab() {
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<ModalState | null>(null);

  // ---------------------------------------------------------------------------
  // Carga de usuarios y roles desde el backend
  // ---------------------------------------------------------------------------
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [listaUsuarios, listaRoles] = await Promise.all([
        getUsuarios(),
        getRoles(),
      ]);
      setUsuarios(listaUsuarios);
      setRoles(listaRoles);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "No se pudieron cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearUsuario = async (input: CrearUsuarioInput) => {
    const nuevoUsuario = await crearUsuario(input);
    setUsuarios((prev) =>
      [...prev, nuevoUsuario].sort((a, b) => a.username.localeCompare(b.username)),
    );
    setSuccessModal({
      title: "¡Usuario creado con éxito!",
      message: `El usuario ${nuevoUsuario.username} fue registrado correctamente.`,
    });
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsEditModalOpen(true);
  };

  const handleGuardarRol = async (id: number, data: AsignarRolInput) => {
    const usuarioActualizado = await asignarRol(id, data);

    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario,
      ),
    );

    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSuccessModal({
      title: "¡Rol actualizado!",
      message: `El rol de ${usuarioActualizado.username} fue actualizado correctamente.`,
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
          roles={roles}
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

        {loadError && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 mb-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-xl"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={cargarDatos}
              className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-bold text-red-800 bg-white border border-red-300 rounded-lg hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <RefreshCw size={14} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-600 text-sm py-8 justify-center">
            <Loader2 size={20} className="animate-spin text-[#218a72]" aria-hidden="true" />
            Cargando usuarios...
          </div>
        ) : (
          <UsuariosList
            usuarios={usuarios}
            currentUserId={user?.id}
            onEditar={handleEditarUsuario}
          />
        )}
      </section>

      {selectedUser && (
        <UsuarioEditModal
          usuario={selectedUser}
          roles={roles}
          isOpen={isEditModalOpen}
          onClose={handleCerrarModal}
          onSave={handleGuardarRol}
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
