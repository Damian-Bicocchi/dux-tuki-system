import { useAuth } from '../../app/context/AuthContext';
import { PermissionKey } from '../../config/permissions';


export const usePermission = () => {
  const { user } = useAuth();

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!user) return false;

    // Regla de oro: Administrador pasa directo sin importar la lista
    if (user.isAdmin) return true;

    // Si tiene un rol asignado, verificamos si contiene el permiso
    return user.role?.permissions.includes(permission) ?? false;
  };

  return { hasPermission };
};