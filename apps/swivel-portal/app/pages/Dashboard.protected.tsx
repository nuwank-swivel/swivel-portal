import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from './Dashboard';
export default function DashboardProtected() {
  return <ProtectedRoute><Dashboard /></ProtectedRoute>;
}