import { Link } from 'react-router-dom';
import { EnsembleMark } from '../EnsembleMark';

export function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand/50 bg-cream/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5 text-espresso" aria-label="ensemble — accueil">
          <EnsembleMark className="h-5 w-5 shrink-0" />
          <span className="text-sm font-light tracking-[0.2em] uppercase">ensemble</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/connexion"
            className="rounded-full border border-espresso/15 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-wider2 text-espresso transition-colors hover:border-espresso/30"
          >
            Connexion
          </Link>
          <Link
            to="/demarrer"
            className="rounded-full bg-orange px-4 py-2 text-xs font-medium uppercase tracking-wider2 text-cream shadow-md shadow-orange/25 transition-colors hover:bg-orange-dark"
          >
            Démarrer
          </Link>
        </div>
      </div>
    </header>
  );
}
