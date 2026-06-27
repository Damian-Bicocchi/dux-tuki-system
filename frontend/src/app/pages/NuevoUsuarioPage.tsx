import { useState } from 'react';

type Tab = 'usuarios' | 'categorias' | 'roles';

export default function NuevoUsuarioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('usuarios');

  return (
    <div className="px-5 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Administración del sistema
      </h1>

      <div
        role="tablist"
        aria-label="Secciones de administración"
        className="border-b border-gray-200 mb-8"
      >
        <div className="flex gap-2">
          <button
            type="button"
            role="tab"
            id="tab-usuarios"
            aria-controls="panel-usuarios"
            aria-selected={activeTab === 'usuarios'}
            onClick={() => setActiveTab('usuarios')}
            className={`px-5 py-3 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'usuarios'
                ? 'bg-[#218a72] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Administrar usuarios
          </button>

          <button
            type="button"
            role="tab"
            id="tab-categorias"
            aria-controls="panel-categorias"
            aria-selected={activeTab === 'categorias'}
            onClick={() => setActiveTab('categorias')}
            className={`px-5 py-3 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'categorias'
                ? 'bg-[#218a72] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Categorías
          </button>

          <button
            type="button"
            role="tab"
            id="tab-roles"
            aria-controls="panel-roles"
            aria-selected={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            className={`px-5 py-3 font-semibold rounded-t-xl transition-colors ${
              activeTab === 'roles'
                ? 'bg-[#218a72] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Roles
          </button>
        </div>
      </div>

      {activeTab === 'usuarios' && (
        <section
          role="tabpanel"
          id="panel-usuarios"
          aria-labelledby="tab-usuarios"
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900">
            Administrar usuarios
          </h2>
        </section>
      )}

      {activeTab === 'categorias' && (
        <section
          role="tabpanel"
          id="panel-categorias"
          aria-labelledby="tab-categorias"
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900">
            Categorías
          </h2>
        </section>
      )}

      {activeTab === 'roles' && (
        <section
          role="tabpanel"
          id="panel-roles"
          aria-labelledby="tab-roles"
          className="bg-white border border-gray-200 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900">
            Roles
          </h2>
        </section>
      )}
    </div>
  );
}