import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  // No está autenticado
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Requiere admin pero no lo es
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/events" replace />;
  }

  return children;
};

export default ProtectedRoute;
