import { Link } from 'react-router-dom';
import { EnsembleMark } from './EnsembleMark';

type EnsembleLogoProps = {
  to?: string;
  className?: string;
  variant?: 'default' | 'light';
};

export function EnsembleLogo({ to = '/', className, variant = 'default' }: EnsembleLogoProps) {
  const tone =
    variant === 'light'
      ? 'text-cream/80 hover:text-cream'
      : 'text-warmgray hover:text-espresso';

  return (
    <Link
      to={to}
      className={[
        'inline-flex items-center gap-2 text-xs uppercase tracking-wider2 transition-colors',
        tone,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="ensemble — accueil"
    >
      <EnsembleMark className="h-[14px] w-[14px] shrink-0 text-espresso" />
      <span>ensemble</span>
    </Link>
  );
}
