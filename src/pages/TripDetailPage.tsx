import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { completeTrip, getTrip, rateTrip } from '../api/trips';
import { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Spinner from '../components/Spinner';
import type { Trip } from '../types';
import { fullName, formatDateTime, fmtRating, initials } from '../utils';

const POLL_MS = 4000;

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getTrip(tripId);
      setTrip(data);
      return data;
    } catch (err) {
      setError(extractError(err));
      return null;
    }
  }, [tripId]);

  // Carga inicial + polling mientras el viaje esté PENDING o IN_PROGRESS.
  useEffect(() => {
    let mounted = true;

    const stopPolling = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    (async () => {
      const data = await load();
      if (!mounted) return;
      setLoading(false);

      if (data && data.status !== 'COMPLETED') {
        timerRef.current = setInterval(async () => {
          const fresh = await load();
          if (fresh && fresh.status === 'COMPLETED') stopPolling();
        }, POLL_MS);
      }
    })();

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [load]);

  if (loading) {
    return (
      <div className="page-center">
        <Spinner label="Cargando viaje…" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container container--narrow">
        <div className="alert alert--error">{error || 'No se encontró el viaje.'}</div>
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  const isDriver = user?.role === 'DRIVER';
  const isPolling = trip.status !== 'COMPLETED';

  return (
    <div className="container container--narrow">
      <button className="link-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="page-head">
        <h1>Viaje #{trip.id}</h1>
        <StatusBadge status={trip.status} />
      </div>

      {isPolling && (
        <p className="poll-note">
          <span className="pulse" /> Actualizando en vivo cada {POLL_MS / 1000}s…
        </p>
      )}

      {/* Ruta */}
      <div className="card">
        <div className="route route--lg">
          <span className="route-dot route-dot--from" />
          <div>
            <span className="route-label">Recojo</span>
            <span className="route-text">{trip.pickupAddress}</span>
          </div>
        </div>
        <div className="route-line" />
        <div className="route route--lg">
          <span className="route-dot route-dot--to" />
          <div>
            <span className="route-label">Destino</span>
            <span className="route-text">{trip.dropoffAddress}</span>
          </div>
        </div>

        <dl className="meta-grid">
          <div>
            <dt>Solicitado</dt>
            <dd>{formatDateTime(trip.requestedAt)}</dd>
          </div>
          <div>
            <dt>Aceptado</dt>
            <dd>{formatDateTime(trip.acceptedAt)}</dd>
          </div>
          <div>
            <dt>Completado</dt>
            <dd>{formatDateTime(trip.completedAt)}</dd>
          </div>
        </dl>
      </div>

      {isDriver ? (
        <DriverSection trip={trip} onChanged={setTrip} />
      ) : (
        <PassengerSection trip={trip} onChanged={setTrip} refreshUser={refreshUser} />
      )}
    </div>
  );
}

/* ---------- Vista pasajero: conductor asignado + calificación ---------- */

function PassengerSection({
  trip,
  onChanged,
  refreshUser,
}: {
  trip: Trip;
  onChanged: (t: Trip) => void;
  refreshUser: () => Promise<void>;
}) {
  const canRate = trip.status === 'COMPLETED' && trip.passengerRating === null;

  return (
    <>
      <div className="card">
        <h2 className="section-title">Tu conductor</h2>
        {trip.driver ? (
          <div className="person">
            <div className="avatar">{initials(trip.driver)}</div>
            <div>
              <p className="person-name">{fullName(trip.driver)}</p>
              <p className="muted">⭐ {fmtRating(trip.driver.rating)}</p>
            </div>
          </div>
        ) : (
          <div className="searching">
            <span className="pulse" />
            Buscando conductor…
          </div>
        )}
      </div>

      {trip.passengerRating !== null && (
        <div className="card">
          <h2 className="section-title">Tu calificación</h2>
          <StarRating value={trip.passengerRating} readOnly />
          {trip.ratingComment && <p className="quote">“{trip.ratingComment}”</p>}
        </div>
      )}

      {canRate && <RatingForm tripId={trip.id} onRated={onChanged} refreshUser={refreshUser} />}
    </>
  );
}

function RatingForm({
  tripId,
  onRated,
  refreshUser,
}: {
  tripId: number;
  onRated: (t: Trip) => void;
  refreshUser: () => Promise<void>;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError('Elige entre 1 y 5 estrellas.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const updated = await rateTrip(tripId, { rating, comment: comment || undefined });
      onRated(updated);
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(extractError(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card form">
      <h2 className="section-title">Califica tu viaje</h2>
      <StarRating value={rating} onChange={setRating} />
      <div className="field">
        <label htmlFor="comment">Comentario (opcional)</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="¿Cómo estuvo el viaje?"
        />
      </div>
      {error && <div className="alert alert--error">{error}</div>}
      <button className="btn btn--primary btn--block" disabled={submitting} type="submit">
        {submitting ? 'Enviando…' : 'Enviar calificación'}
      </button>
    </form>
  );
}

/* ---------- Vista conductor: datos del pasajero + completar ---------- */

function DriverSection({ trip, onChanged }: { trip: Trip; onChanged: (t: Trip) => void }) {
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const handleComplete = async () => {
    setError('');
    setWorking(true);
    try {
      const updated = await completeTrip(trip.id);
      onChanged(updated);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <div className="card">
        <h2 className="section-title">Pasajero</h2>
        <div className="person">
          <div className="avatar">{initials(trip.passenger)}</div>
          <div>
            <p className="person-name">{fullName(trip.passenger)}</p>
            <p className="muted">{trip.passenger.email}</p>
          </div>
        </div>
      </div>

      {trip.status === 'IN_PROGRESS' && (
        <div className="card">
          {error && <div className="alert alert--error">{error}</div>}
          <button className="btn btn--primary btn--block" onClick={handleComplete} disabled={working}>
            {working ? 'Completando…' : 'Completar viaje'}
          </button>
        </div>
      )}

      {trip.status === 'COMPLETED' && (
        <div className="card summary">
          <p className="summary-title">✅ Viaje completado</p>
          <p className="muted">
            {trip.passengerRating !== null
              ? `El pasajero te calificó con ${trip.passengerRating} ⭐`
              : 'A la espera de que el pasajero califique.'}
          </p>
          {trip.ratingComment && <p className="quote">“{trip.ratingComment}”</p>}
        </div>
      )}
    </>
  );
}
