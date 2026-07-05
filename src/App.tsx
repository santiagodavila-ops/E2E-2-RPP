import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute, { homeFor } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import LoginPage from './pages/LoginPage';
import PassengerDashboard from './pages/PassengerDashboard';
import RequestTripPage from './pages/RequestTripPage';
import TripDetailPage from './pages/TripDetailPage';
import DriverDashboard from './pages/DriverDashboard';
import HistoryPage from './pages/HistoryPage';

// Layout con navbar para todas las páginas autenticadas.
function AppShell({ children }: { children: JSX.Element }) {
  return (
    <>
      <Navbar />
      <div className="app-main">{children}</div>
    </>
  );
}

// Redirige "/" al home según el rol (o al login si no hay sesión).
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Cargando…" />
      </div>
    );
  }
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Pasajero */}
      <Route
        path="/passenger"
        element={
          <ProtectedRoute role="PASSENGER">
            <AppShell>
              <PassengerDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/request"
        element={
          <ProtectedRoute role="PASSENGER">
            <AppShell>
              <RequestTripPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Conductor */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute role="DRIVER">
            <AppShell>
              <DriverDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Común a ambos roles */}
      <Route
        path="/trips/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <TripDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppShell>
              <HistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
