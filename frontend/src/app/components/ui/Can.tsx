import React from 'react';
import { PermissionKey } from '../../../config/permissions';
import { usePermission } from '../../hooks/usePermission';

interface CanProps {
  do: PermissionKey;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ do: permission, children }) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) return null;

  return <>{children}</>;
};