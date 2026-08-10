import { useState } from 'react';
import { UsuariosTab } from './administracion/tabs/UsuariosTab';
import { CategoriasTab } from './administracion/tabs/CategoriasTab';
import { RolesTab } from './administracion/tabs/RolesTab';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../components/ui/tabs';

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
        component: CategoriasTab,
    },
    {
        id: 'roles',
        label: 'Administrar roles',
        component: RolesTab,
    },
];

export default function AdministracionPage() {
    const [activeTab, setActiveTab] = useState<TabId>('usuarios');

    return (
        <div className="px-5 py-6 max-w-6xl mx-auto">
            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as TabId)}
                orientation="vertical"
                className="gap-6 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start"
            >
                <TabsList
                    aria-label="Secciones de administración"
                    className="h-auto w-full flex-col items-stretch gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-6"
                >
                    <div className="px-2 pb-1 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                        Secciones de administración
                    </div>

                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="h-auto w-full justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 data-[state=active]:bg-[#218a72] data-[state=active]:text-white"
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {tab.label}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="min-w-0 lg:col-start-2 lg:row-start-1">
                    {tabs.map((tab) => {
                        const TabComponent = tab.component;

                        return (
                            <TabsContent
                                key={tab.id}
                                value={tab.id}
                                className="mt-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                            >
                                <TabComponent />
                            </TabsContent>
                        );
                    })}
                </div>
            </Tabs>
        </div>
    );
}
