import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from './ProtectedRoute';
import { initials } from '../utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to={homeFor(user.role)} className="brand">
          <span className="brand-mark">◈</span>
          RideNow
        </NavLink>

        <nav className="nav-links">
          {user.role === 'PASSENGER' ? (
            <>
              <NavLink to="/passenger" end className="nav-link">
                Inicio
              </NavLink>
              <NavLink to="/passenger/request" className="nav-link">
                Pedir viaje
              </NavLink>
            </>
          ) : (
            <NavLink to="/driver" end className="nav-link">
              Panel
            </NavLink>
          )}
          <NavLink to="/history" className="nav-link">
            Historial
          </NavLink>
        </nav>

        <div className="nav-user">
          <div className="avatar" title={user.email}>
            {initials(user)}
          </div>
          <div className="nav-user-meta">
            <span className="nav-user-name">{user.firstName}</span>
            <span className="nav-user-role">
              {user.role === 'DRIVER' ? 'Conductor' : 'Pasajero'}
            </span>
          </div>
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
