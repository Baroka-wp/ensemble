import { Link } from 'react-router-dom';
import { EnsembleMark } from '../components/EnsembleMark';

function SpaceCard({
  to,
  title,
  description,
  cta,
  variant,
  className,
}: {
  to: string;
  title: string;
  description?: string;
  cta: string;
  variant: 'restaurant' | 'influencer';
  className?: string;
}) {
  const isRestaurant = variant === 'restaurant';

  return (
    <Link
      to={to}
      className={[
        'group relative flex flex-col justify-between min-h-[200px] md:min-h-[240px] p-6 md:p-8 rounded-2xl border transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/50',
        isRestaurant
          ? 'bg-espresso border-espresso text-cream shadow-lg shadow-espresso/25 hover:shadow-espresso/30'
          : 'bg-white/95 border-sand/90 text-espresso shadow-md shadow-espresso/5 hover:border-orange/30',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div>
        <p
          className={[
            'text-[10px] uppercase tracking-wider2 mb-3',
            isRestaurant ? 'text-cream/55' : 'text-orange',
          ].join(' ')}
        >
          {isRestaurant ? 'Gérants & équipes' : 'Partenaires'}
        </p>
        <h2
          className={[
            'font-sans text-2xl md:text-3xl font-light tracking-wide leading-tight',
            isRestaurant ? 'text-cream' : 'text-espresso',
          ].join(' ')}
        >
          {title}
        </h2>
        {description && (
          <p
            className={[
              'font-serif text-sm mt-3 max-w-[28ch] leading-relaxed',
              isRestaurant ? 'text-cream/70' : 'text-warmgray',
            ].join(' ')}
          >
            {description}
          </p>
        )}
      </div>

      <span
        className={[
          'inline-flex items-center gap-2 mt-8 text-xs uppercase tracking-wider2 font-medium',
          isRestaurant
            ? 'text-cream group-hover:text-halo transition-colors'
            : 'text-orange group-hover:text-orange-dark transition-colors',
        ].join(' ')}
      >
        {cta}
        <span aria-hidden className="text-base transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>

      {!isRestaurant && (
        <span
          className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-orange/10 blur-2xl pointer-events-none"
          aria-hidden
        />
      )}
    </Link>
  );
}

export function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-linen via-cream to-mica overflow-hidden">
      {/* Fond décoratif asymétrique */}
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-orange/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14 lg:py-16 min-h-screen flex flex-col">
        {/* En-tête marque — centré horizontalement et verticalement */}
        <div className="flex-1 flex items-center justify-center">
          <header className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-5">
              <EnsembleMark className="h-9 w-9 text-espresso shrink-0" />
            </div>
            <h1 className="font-sans font-thin text-5xl md:text-6xl lg:text-7xl tracking-wider2 text-espresso leading-none">
              ensemble
            </h1>
            <p className="text-xs uppercase tracking-wider2 text-warmgray mt-4">
              Campagnes d’influence
            </p>
          </header>
        </div>

        {/* Grille asymétrique */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 lg:gap-8 items-end shrink-0">
          <SpaceCard
            variant="restaurant"
            to="/login"
            title="Espace restaurant"
            cta="Connexion"
            className="md:col-span-7 md:row-start-1 lg:min-h-[280px]"
          />

          <SpaceCard
            variant="influencer"
            to="/i/login"
            title="Espace influenceur"
            cta="Se connecter"
            className="md:col-span-5 md:col-start-8 md:-mt-8 lg:-mt-16 md:row-start-1"
          />
        </div>

        <footer className="mt-10 md:mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-warmgray">
          <span className="font-serif">Nouveau restaurant ?</span>
          <Link to="/register" className="text-orange hover:text-orange-dark underline underline-offset-4 transition-colors">
            Créer un compte
          </Link>
        </footer>
      </div>
    </main>
  );
}
