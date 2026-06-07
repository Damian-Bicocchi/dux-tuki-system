export function CategoriasTab() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-bold text-gray-900">
          Categorías
        </h2>

        <p className="text-gray-600 mt-1">
          Administración de las categorías disponibles en el sistema.
        </p>
      </header>

      <section
        className="bg-gray-50 border border-gray-200 rounded-2xl p-6"
        aria-labelledby="categorias-title"
      >
        <h3
          id="categorias-title"
          className="text-lg font-semibold"
        >
          Gestión de categorías
        </h3>

        <p className="mt-2 text-gray-600">
          Próximamente se mostrará el listado de categorías y las
          herramientas para crearlas y editarlas.
        </p>
      </section>
    </div>
  );
}