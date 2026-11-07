import { useState } from 'react';
import { UsuariosTab } from './administracion/tabs/UsuariosTab';
import { RolesTab } from './administracion/tabs/RolesTab';
import { handleTabListKeyDown } from '../utils/tabListKeyboard';

type TabId = 'usuarios' | 'roles';

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
    id: 'roles',
    label: 'Administrar roles',
    component: RolesTab,
  },
];

export default function ConfiguracionesAvanzadasPage() {
  const [activeTab, setActiveTab] = useState<TabId>('usuarios');

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="px-5 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Administración del sistema
      </h1>

      <div
        role="tablist"
        aria-label="Secciones de administración"
        onKeyDown={handleTabListKeyDown}
        className="border-b border-gray-200 mb-8"
      >
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-controls={`admin-panel-${tab.id}`}
              aria-selected={activeTab === tab.id}
              tabIndex={activeTab === tab.id ? 0 : -1}
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
        id={`admin-panel-${activeTab}`}
        aria-labelledby={`admin-tab-${activeTab}`}
        className="bg-white border border-gray-200 rounded-2xl p-6"
      >
        {ActiveComponent && <ActiveComponent />}
      </section>
    </div>
  );
}