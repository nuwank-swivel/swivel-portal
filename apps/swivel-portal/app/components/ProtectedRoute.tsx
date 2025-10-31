import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthContext } from '@/lib/AuthContext';
import { Logger } from '@/lib/logger';

export default function ProtectedRoute({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { user } = useAuthContext();
  const location = useLocation();
  if (user === null) {
    Logger.warn('[auth] Blocked unauthenticated route access', {
      pathname: location.pathname,
      search: location.search,
    });
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
