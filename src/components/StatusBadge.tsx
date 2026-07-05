import type { TripStatus } from '../types';
import { STATUS_LABEL } from '../utils';

export default function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`badge badge--${status.toLowerCase()}`}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
