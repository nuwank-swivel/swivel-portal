import React from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { Navigate, useLocation } from 'react-router';

export default function ProtectedRoute({
  children,
}: {
  children: React.JSX.Element;
}) {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
