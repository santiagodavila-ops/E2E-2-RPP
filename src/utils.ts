import type { TripStatus, User } from './types';

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fullName(u: User | null | undefined): string {
  if (!u) return '—';
  return `${u.firstName} ${u.lastName}`;
}

// El rating llega como Double; si por algún motivo viniera null, mostramos 0.0.
export function fmtRating(rating: number | null | undefined): string {
  return (rating ?? 0).toFixed(1);
}

export function initials(u: User | null | undefined): string {
  if (!u) return '?';
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
}

export const STATUS_LABEL: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
};
