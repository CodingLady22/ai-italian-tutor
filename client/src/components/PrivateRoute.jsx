import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center font-sans">
        Caricamento...
      </div>
    );

  return user ? children : <Navigate to="/login" />;
}
