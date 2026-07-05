import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrip, getAvailableDrivers } from '../api/trips';
import { extractError } from '../api/client';
import Spinner from '../components/Spinner';
import type { User } from '../types';
import { fmtRating, initials } from '../utils';

export default function RequestTripPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [pickupAddress, setPickup] = useState('');
  const [dropoffAddress, setDropoff] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAvailableDrivers()
      .then(setDrivers)
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoadingDrivers(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const trip = await createTrip({ pickupAddress, dropoffAddress });
      navigate(`/trips/${trip.id}`, { replace: true });
    } catch (err) {
      setError(extractError(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container container--narrow">
      <button className="link-back" onClick={() => navigate('/passenger')}>
        ← Volver
      </button>
      <h1>Pedir un viaje</h1>

      <div className="two-col">
        <form onSubmit={handleSubmit} className="card form">
          <div className="field">
            <label htmlFor="pickup">Punto de recojo</label>
            <input
              id="pickup"
              value={pickupAddress}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Av. Javier Prado 100"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="dropoff">Destino</label>
            <input
              id="dropoff"
              value={dropoffAddress}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Miraflores, Lima"
              required
            />
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          <button className="btn btn--primary btn--block" disabled={submitting} type="submit">
            {submitting ? 'Solicitando…' : 'Confirmar viaje'}
          </button>
        </form>

        <aside className="card">
          <h2 className="section-title">Conductores disponibles</h2>
          {loadingDrivers ? (
            <Spinner label="Buscando conductores…" />
          ) : drivers.length === 0 ? (
            <p className="muted">
              No hay conductores disponibles ahora mismo, pero igual puedes solicitar el viaje: se
              asignará en cuanto uno lo acepte.
            </p>
          ) : (
            <ul className="driver-list">
              {drivers.map((d) => (
                <li key={d.id} className="driver-item">
                  <div className="avatar avatar--sm">{initials(d)}</div>
                  <div className="driver-meta">
                    <span className="driver-name">
                      {d.firstName} {d.lastName}
                    </span>
                    <span className="driver-rating">⭐ {fmtRating(d.rating)}</span>
                  </div>
                  <span className="pill pill--ok">Disponible</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
