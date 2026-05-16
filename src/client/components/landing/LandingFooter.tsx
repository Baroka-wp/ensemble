import { Link } from 'react-router-dom';
import { EnsembleMark } from '../EnsembleMark';

export function LandingFooter() {
  return (
    <footer className="border-t border-sand/60 bg-linen py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-espresso">
            <EnsembleMark className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">ensemble</span>
          </Link>
          <p className="mt-4 max-w-xs font-serif text-sm text-warmgray">
            Campagnes d’influence pour la restauration locale.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-warmgray">Restaurant</p>
            <ul className="mt-4 space-y-2 text-sm text-espresso/80">
              <li>
                <Link to="/register" className="hover:text-orange">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-warmgray">Influenceur</p>
            <ul className="mt-4 space-y-2 text-sm text-espresso/80">
              <li>
                <Link to="/i/login" className="hover:text-orange">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-warmgray">Produit</p>
            <ul className="mt-4 space-y-2 text-sm text-espresso/80">
              <li>
                <a href="#comment" className="hover:text-orange">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#promesses" className="hover:text-orange">
                  Promesses
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-5 text-center text-xs text-warmgray/70 md:px-8">
        © {new Date().getFullYear()} ensemble — Tous droits réservés.
      </p>
    </footer>
  );
}
