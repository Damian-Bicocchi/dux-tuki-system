export function RolesTab() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-bold text-gray-900">
          Roles
        </h2>

        <p className="text-gray-600 mt-1">
          Administración de los roles disponibles en el sistema.
        </p>
      </header>

      <section
        className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
        aria-labelledby="roles-title"
      >
        <h3
          id="roles-title"
          className="text-lg font-semibold"
        >
          Gestión de roles
        </h3>

        <p className="mt-2 text-gray-600">
          Próximamente se mostrará el listado de roles y las
          herramientas para crearlas y editarlas.
        </p>
      </section>
    </div>
  );
}