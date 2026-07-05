import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import Spinner from './Spinner';

interface Props {
  children: JSX.Element;
  role?: Role; // si se especifica, solo ese rol puede entrar
}

// Ruta home según el rol del usuario.
export function homeFor(role: Role): string {
  return role === 'DRIVER' ? '/driver' : '/passenger';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Cargando…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta pide un rol distinto al del usuario, lo mandamos a su propio home.
  if (role && user.role !== role) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
}
