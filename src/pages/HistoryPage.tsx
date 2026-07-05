import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTripsAsDriver, getMyTripsAsPassenger } from '../api/trips';
import { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import type { Trip, TripStatus } from '../types';
import { fullName, formatDateTime } from '../utils';

type Filter = 'ALL' | TripStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'IN_PROGRESS', label: 'En curso' },
  { key: 'COMPLETED', label: 'Completados' },
];

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  const isDriver = user?.role === 'DRIVER';

  useEffect(() => {
    const fetcher = isDriver ? getMyTripsAsDriver : getMyTripsAsPassenger;
    fetcher()
      .then(setTrips)
      .catch((err) => setError(extractError(err)))
      .finally(() => setLoading(false));
  }, [isDriver]);

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter]
  );

  return (
    <div className="container">
      <div className="page-head">
        <h1>Historial de viajes</h1>
      </div>

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Cargando historial…" />
      ) : error ? (
        <div className="alert alert--error">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <p className="empty-title">Sin viajes para este filtro</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Recojo</th>
                <th>Destino</th>
                <th>{isDriver ? 'Pasajero' : 'Conductor'}</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/trips/${t.id}`)}>
                  <td>{t.id}</td>
                  <td>{t.pickupAddress}</td>
                  <td>{t.dropoffAddress}</td>
                  <td>{isDriver ? fullName(t.passenger) : fullName(t.driver)}</td>
                  <td>{formatDateTime(t.requestedAt)}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="row-arrow">→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
