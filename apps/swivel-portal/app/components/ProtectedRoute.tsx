import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthContext } from '@/lib/AuthContext';

export default function ProtectedRoute({
  children,
}: {
  children: React.JSX.Element;
}) {
  const { user } = useAuthContext();
  const location = useLocation();
  if (user === null) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
