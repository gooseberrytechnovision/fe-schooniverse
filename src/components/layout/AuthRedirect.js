import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthRedirect = () => {
  const { isAuthenticated, loading, isFirstTimeLogin } = useSelector((state) => state.auth);

  if (loading) return null; // Avoid redirecting while authentication is being checked

  if (isAuthenticated) {
    if (isFirstTimeLogin) {
      return <Navigate to="/reset-password" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

export default AuthRedirect;
