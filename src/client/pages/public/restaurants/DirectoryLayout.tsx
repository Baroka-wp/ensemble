import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { EnsembleMark } from '../../../components/EnsembleMark';

/** Layout dédié aux pages publiques de découverte (/restaurants, /restaurants/:slug). */
export function DirectoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-espresso">
      <header className="sticky top-0 z-40 border-b border-sand/60 bg-cream/85 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-espresso"
            aria-label="ensemble — accueil"
          >
            <EnsembleMark className="h-5 w-5" />
            <span className="text-sm font-light tracking-[0.2em] uppercase">ensemble</span>
          </Link>
          <Link
            to="/restaurants"
            className="text-[10px] uppercase tracking-wider2 text-warmgray hover:text-espresso transition-colors sm:text-xs"
          >
            Tous les restaurants
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
