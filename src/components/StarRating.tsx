import { useState } from 'react';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

// Estrellas 1-5. Interactivo si se pasa onChange y readOnly es false.
export default function StarRating({ value, onChange, readOnly = false, size = 28 }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="stars" style={{ fontSize: size }} role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`Calificación ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= display ? 'star--on' : ''} ${readOnly ? 'star--readonly' : ''}`}
          disabled={readOnly}
          aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
