import { useState } from 'react';

interface Props {
  value: number;
  onChange: (n: number) => void;
  label: string;
  /** Optionnel : sous-label descriptif (ex: "Très satisfait" etc.) */
}

const LABELS = ['', 'Décevant', 'Moyen', 'Correct', 'Bien', 'Excellent'];

export function StarRatingInput({ value, onChange, label }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-wider2 text-warmgray font-medium">{label}</span>
        <span className="text-[11px] text-warmgray italic min-h-[1em]">
          {display > 0 ? LABELS[display] : ''}
        </span>
      </div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const isActive = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              className={[
                'p-1.5 rounded-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/30',
                isActive ? 'text-orange' : 'text-sand',
              ].join(' ')}
            >
              <Star filled={isActive} className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5z" />
    </svg>
  );
}

/** Affichage en lecture seule des étoiles (utile pour les avis publics). */
export function StarRatingDisplay({
  value,
  size = 'md',
  className,
}: {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const sizeCls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={['inline-flex items-center gap-0.5 text-orange', className].filter(Boolean).join(' ')}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= value} className={sizeCls} />
      ))}
    </div>
  );
}
