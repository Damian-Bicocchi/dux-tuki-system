import React from 'react';
import { useNavigate } from 'react-router';
import { ShieldAlert, Home } from 'lucide-react';
import type { PermissionKey } from '../../config/permissions';
import { usePermission } from '../hooks/usePermission';

interface RequirePermissionProps {
  /** Permiso requerido. Con un arreglo alcanza con tener cualquiera de ellos. */
  permission: PermissionKey | PermissionKey[];
  children: React.ReactNode;
}

/**
 * Envuelve una página completa: si el usuario no tiene el permiso, en lugar del
 * contenido muestra un aviso accesible con un acceso directo al inicio.
 *
 * Es una barrera de UX: la autorización real la hace el backend en cada ruta.
 */
export function RequirePermission({ permission, children }: RequirePermissionProps) {
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return (
    <main
      role="main"
      aria-labelledby="sin-permiso-titulo"
      className="px-5 py-16 max-w-lg mx-auto text-center"
    >
      <div className="bg-white border-2 border-amber-200 rounded-2xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
          <ShieldAlert size={32} className="text-amber-600" aria-hidden="true" />
        </div>
        <h1 id="sin-permiso-titulo" className="text-xl font-bold text-gray-900 mb-2">
          No tenés permiso para ver esta sección
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Tu rol actual no incluye acceso a esta parte del sistema. Si creés que es un error,
          pedile a un administrador que revise tus permisos.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app/')}
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#218a72] hover:bg-[#1b6f5c] text-white font-bold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-[#218a72]/30"
        >
          <Home size={18} aria-hidden="true" />
          Volver al inicio
        </button>
      </div>
    </main>
  );
}
