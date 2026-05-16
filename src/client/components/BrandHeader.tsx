import { Link } from 'react-router-dom';
import { EnsembleMark } from './EnsembleMark';

type BrandHeaderProps = {
  to?: string;
  className?: string;
};

export function BrandHeader({ to = '/', className }: BrandHeaderProps) {
  return (
    <Link
      to={to}
      className={['group block text-center', className].filter(Boolean).join(' ')}
      aria-label="ensemble — accueil"
    >
      <div className="flex justify-center mb-4">
        <EnsembleMark className="h-8 w-8 text-espresso shrink-0 transition-colors group-hover:text-orange" />
      </div>
      <p className="font-sans font-thin text-3xl tracking-wider2 text-espresso leading-none">ensemble</p>
      <p className="text-[10px] uppercase tracking-wider2 text-warmgray mt-2">Campagnes d’influence</p>
    </Link>
  );
}
