import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyTripsAsPassenger } from '../api/trips';
import { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import type { Trip } from '../types';
import { formatDateTime, fmtRating } from '../utils';

export default function PassengerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTripsAsPassenger()
      .then(setTrips)
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const active = trips.filter((t) => t.status !== 'COMPLETED');
  const past = trips.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Hola, {user?.firstName} 👋</h1>
          <p className="muted">¿A dónde vamos hoy?</p>
        </div>
        <Link to="/passenger/request" className="btn btn--primary">
          + Pedir viaje
        </Link>
      </div>

      {loading ? (
        <Spinner label="Cargando tus viajes…" />
      ) : error ? (
        <div className="alert alert--error">{error}</div>
      ) : trips.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Aún no tienes viajes</p>
          <p className="muted">Pide tu primer viaje y aparecerá aquí.</p>
          <Link to="/passenger/request" className="btn btn--primary">
            Pedir mi primer viaje
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="section-title">Viajes en curso</h2>
              <div className="trip-grid">
                {active.map((t) => (
                  <TripCard key={t.id} trip={t} onClick={() => navigate(`/trips/${t.id}`)} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="section-title">Historial reciente</h2>
            {past.length === 0 ? (
              <p className="muted">Todavía no completas ningún viaje.</p>
            ) : (
              <div className="trip-grid">
                {past.map((t) => (
                  <TripCard key={t.id} trip={t} onClick={() => navigate(`/trips/${t.id}`)} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function TripCard({ trip, onClick }: { trip: Trip; onClick: () => void }) {
  const needsRating = trip.status === 'COMPLETED' && trip.passengerRating === null;
  return (
    <button className="trip-card" onClick={onClick}>
      <div className="trip-card-top">
        <StatusBadge status={trip.status} />
        <span className="trip-card-date">{formatDateTime(trip.requestedAt)}</span>
      </div>
      <div className="route">
        <span className="route-dot route-dot--from" />
        <span className="route-text">{trip.pickupAddress}</span>
      </div>
      <div className="route">
        <span className="route-dot route-dot--to" />
        <span className="route-text">{trip.dropoffAddress}</span>
      </div>
      {trip.driver && (
        <p className="trip-card-driver">
          Conductor: {trip.driver.firstName} {trip.driver.lastName} · ⭐ {fmtRating(trip.driver.rating)}
        </p>
      )}
      {needsRating && <span className="pill pill--action">Califica tu viaje →</span>}
    </button>
  );
}
