import { Link } from 'react-router-dom';
import { SocialOrbitVisual } from './SocialOrbitVisual';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-24 md:pt-12 md:pb-32 lg:pb-36">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange/20 blur-[100px] animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rounded-full bg-terracotta/15 blur-3xl animate-float-delayed"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-orange">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
            </span>
            Campagnes d’influence locales
          </p>
          <h1 className="mt-6 font-sans text-4xl font-thin leading-[1.05] tracking-wide text-espresso sm:text-5xl lg:text-6xl">
            Transformez chaque scan
            <span className="block text-orange">en preuve sociale.</span>
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-orange px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-all hover:bg-orange-dark hover:shadow-orange/40"
            >
              Lancer mon restaurant
            </Link>
            <Link
              to="/i/login"
              className="inline-flex items-center justify-center rounded-full border border-espresso/15 bg-white/70 px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-espresso backdrop-blur-sm transition-colors hover:border-espresso/30 hover:bg-white"
            >
              Espace influenceur
            </Link>
          </div>
          <p className="mt-6 text-xs text-warmgray/80">
            Sans app à installer pour vos clients · Mise en place en quelques minutes
          </p>
        </div>

        <div className="relative z-10 md:justify-self-end">
          <SocialOrbitVisual />
        </div>
      </div>
    </section>
  );
}
