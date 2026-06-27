import { useState } from 'react';
import { UsuariosTab } from './administracion/tabs/UsuariosTab';
import { CategoriasTab } from './administracion/tabs/CategoriasTab';
import { RolesTab } from './administracion/tabs/RolesTab';

type TabId = 'usuarios' | 'categorias' | 'roles';

interface TabDefinition {
  id: TabId;
  label: string;
  component: React.ComponentType;
}

const tabs: TabDefinition[] = [
  {
    id: 'usuarios',
    label: 'Administrar usuarios',
    component: UsuariosTab,
  },
  {
    id: 'categorias',
    label: 'Administrar categorías',
    component: CategoriasTab
  },
  {
    id: 'roles',
    label: "Administrar roles",
    component: RolesTab
  }
];

export default function AdministracionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('usuarios');

  const ActiveComponent =
    tabs.find(tab => tab.id === activeTab)?.component;

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
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-semibold rounded-t-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#218a72] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section
        role="tabpanel"
        className="bg-white border border-gray-200 rounded-2xl p-6"
      >
        {ActiveComponent && <ActiveComponent />}
      </section>
    </div>
  );
}