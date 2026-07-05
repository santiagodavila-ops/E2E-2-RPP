import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../components/ProtectedRoute';
import type { Role } from '../types';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token } =
        mode === 'login'
          ? await apiLogin({ email, password })
          : await apiRegister({ firstName, lastName, email, password, role });

      const me = await login(token);
      navigate(homeFor(me.role), { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  const fillSeed = (seedEmail: string) => {
    setMode('login');
    setEmail(seedEmail);
    setPassword('pass123');
    setError('');
  };

  return (
    <div className="auth">
      <aside className="auth-hero">
        <div className="auth-hero-content">
          <span className="brand brand--lg">
            <span className="brand-mark">◈</span>
            RideNow
          </span>
          <h1>Tu viaje, a un toque.</h1>
          <p>
            Pide un viaje o sal a manejar. Inicia sesión para empezar a moverte por la ciudad.
          </p>

          <div className="seed-hint">
            <p className="seed-hint-title">Cuentas de prueba (contraseña <code>pass123</code>)</p>
            <div className="seed-grid">
              <button type="button" onClick={() => fillSeed('carlos@uber.com')}>
                carlos@uber.com · Conductor
              </button>
              <button type="button" onClick={() => fillSeed('ana@uber.com')}>
                ana@uber.com · Pasajero
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="segmented">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); setError(''); }}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); setError(''); }}
              type="button"
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form" noValidate>
            {mode === 'register' && (
              <div className="form-row">
                <div className="field">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ana"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="García"
                    required
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </div>

            {mode === 'register' && (
              <div className="field">
                <label>Quiero registrarme como</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={role === 'PASSENGER' ? 'active' : ''}
                    onClick={() => setRole('PASSENGER')}
                  >
                    🧑 Pasajero
                  </button>
                  <button
                    type="button"
                    className={role === 'DRIVER' ? 'active' : ''}
                    onClick={() => setRole('DRIVER')}
                  >
                    🚗 Conductor
                  </button>
                </div>
              </div>
            )}

            {error && <div className="alert alert--error">{error}</div>}

            <button className="btn btn--primary btn--block" disabled={loading} type="submit">
              {loading ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
