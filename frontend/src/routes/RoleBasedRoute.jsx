import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role — derived from Appwrite labels in authStore
  // user.role is set by authService.getUserRole() which reads user.labels
  const userRole = user.role || 'candidate';
  const hasPermission = allowedRoles.includes(userRole);

  if (!hasPermission) {
    // Redirect based on user role
    if (userRole === 'recruiter' || userRole === 'admin') {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    return <Navigate to="/candidate/browse" replace />;
  }

  return children;
};

export default RoleBasedRoute;