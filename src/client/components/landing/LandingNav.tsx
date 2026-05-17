import { Link } from 'react-router-dom';
import { EnsembleMark } from '../EnsembleMark';
import { useAudience } from './AudienceContext';

const navBtnBase =
  'inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-medium uppercase tracking-wider2 transition-colors sm:text-xs';

export function LandingNav() {
  const { audience } = useAudience();
  const loginTo = audience === 'restaurant' ? '/login' : '/i/login';
  const registerTo = audience === 'restaurant' ? '/register' : '/i/register';

  return (
    <header className="sticky top-0 z-50 border-b border-sand/50 bg-cream/90 backdrop-blur-xl supports-[backdrop-filter]:bg-cream/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4 md:px-8">
        <Link
          to="/"
          className="inline-flex min-w-0 items-center gap-2 text-espresso sm:gap-2.5"
          aria-label="ensemble — accueil"
        >
          <EnsembleMark className="h-5 w-5 shrink-0" />
          <span className="truncate text-sm font-light tracking-[0.2em] uppercase">ensemble</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <Link
            to="/restaurants"
            className="hidden sm:inline-flex shrink-0 items-center text-xs font-medium uppercase tracking-wider2 text-warmgray hover:text-orange transition-colors px-2"
          >
            Annuaire
          </Link>
          <Link
            to={loginTo}
            className={`${navBtnBase} border border-espresso/15 bg-white/80 px-3 py-1.5 text-espresso hover:border-espresso/30 sm:px-4 sm:py-2`}
          >
            Connexion
          </Link>
          <Link
            to={registerTo}
            className={`${navBtnBase} bg-orange px-3 py-1.5 text-cream shadow-md shadow-orange/25 hover:bg-orange-dark sm:px-4 sm:py-2`}
          >
            Démarrer
          </Link>
        </div>
      </div>
    </header>
  );
}
