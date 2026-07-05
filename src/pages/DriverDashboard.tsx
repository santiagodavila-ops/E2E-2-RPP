import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acceptTrip, getMyTripsAsDriver, getPendingTrips } from '../api/trips';
import { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import type { Trip } from '../types';
import { fullName, formatDateTime, fmtRating } from '../utils';

export default function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Trip[]>([]);
  const [mine, setMine] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([getPendingTrips(), getMyTripsAsDriver()]);
      setPending(p);
      setMine(m);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = mine.find((t) => t.status === 'IN_PROGRESS');

  const handleAccept = async (id: number) => {
    setError('');
    setAcceptingId(id);
    try {
      const trip = await acceptTrip(id);
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(extractError(err));
      setAcceptingId(null);
      // Refrescamos por si el viaje ya fue tomado por otro conductor.
      load();
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Panel del conductor</h1>
          <p className="muted">
            {user?.available ? 'Estás disponible para recibir viajes.' : 'Tienes un viaje en curso.'}
          </p>
        </div>
        <div className="rating-chip">
          <span className="rating-chip-value">⭐ {fmtRating(user?.rating)}</span>
          <span className="rating-chip-label">Tu rating</span>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {loading ? (
        <Spinner label="Cargando panel…" />
      ) : (
        <>
          {active && (
            <section>
              <h2 className="section-title">Viaje activo</h2>
              <div className="card active-trip" onClick={() => navigate(`/trips/${active.id}`)}>
                <div className="active-trip-head">
                  <StatusBadge status={active.status} />
                  <span className="muted">{fullName(active.passenger)}</span>
                </div>
                <div className="route">
                  <span className="route-dot route-dot--from" />
                  <span className="route-text">{active.pickupAddress}</span>
                </div>
                <div className="route">
                  <span className="route-dot route-dot--to" />
                  <span className="route-text">{active.dropoffAddress}</span>
                </div>
                <button className="btn btn--primary btn--block">Completar viaje →</button>
              </div>
            </section>
          )}

          <section>
            <h2 className="section-title">
              Viajes disponibles {pending.length > 0 && <span className="count">{pending.length}</span>}
            </h2>
            {pending.length === 0 ? (
              <div className="empty">
                <p className="empty-title">No hay viajes pendientes</p>
                <p className="muted">Los nuevos pedidos aparecerán aquí.</p>
                <button className="btn btn--ghost" onClick={load}>
                  Actualizar
                </button>
              </div>
            ) : (
              <div className="trip-grid">
                {pending.map((t) => (
                  <div key={t.id} className="trip-card trip-card--static">
                    <div className="trip-card-top">
                      <StatusBadge status={t.status} />
                      <span className="trip-card-date">{formatDateTime(t.requestedAt)}</span>
                    </div>
                    <div className="route">
                      <span className="route-dot route-dot--from" />
                      <span className="route-text">{t.pickupAddress}</span>
                    </div>
                    <div className="route">
                      <span className="route-dot route-dot--to" />
                      <span className="route-text">{t.dropoffAddress}</span>
                    </div>
                    <p className="trip-card-driver">Pasajero: {fullName(t.passenger)}</p>
                    <button
                      className="btn btn--primary btn--block"
                      onClick={() => handleAccept(t.id)}
                      disabled={acceptingId === t.id || !user?.available}
                    >
                      {acceptingId === t.id
                        ? 'Aceptando…'
                        : !user?.available
                        ? 'Termina tu viaje activo'
                        : 'Aceptar viaje'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
