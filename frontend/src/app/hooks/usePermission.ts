import { useAuth } from '../../app/context/AuthContext';
import { PermissionKey } from '../../config/permissions';

/**
 * Hook para consultar permisos del usuario logueado.
 *
 * `hasPermission` acepta una clave o un arreglo de claves: con un arreglo alcanza
 * con tener CUALQUIERA de ellas (mismo criterio que `checkPermission` en el backend).
 */
export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: PermissionKey | PermissionKey[]): boolean => {
    if (!user) return false;

    // Regla de oro: Administrador pasa directo sin importar la lista
    if (user.isAdmin) return true;

    const required = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user.role?.permissions ?? [];

    // Si tiene un rol asignado, verificamos si contiene alguno de los permisos
    return required.some((perm) => userPermissions.includes(perm));
  };

  return { hasPermission, isAdmin: !!user?.isAdmin };
};
