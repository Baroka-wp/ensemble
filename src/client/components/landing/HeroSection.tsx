import { Link } from 'react-router-dom';
import { SocialOrbitVisual } from './SocialOrbitVisual';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20 md:pt-12 md:pb-32 lg:pb-36">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,120vw)] w-[min(520px,120vw)] -translate-x-1/2 rounded-full bg-orange/20 blur-[100px] animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 h-48 w-48 rounded-full bg-terracotta/15 blur-3xl animate-float-delayed sm:-right-20 sm:top-40 sm:h-64 sm:w-64"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 sm:gap-12 sm:px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-16">
        <div className="text-center md:text-left">
          <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-orange sm:text-[10px] sm:tracking-[0.2em] md:justify-start">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
            </span>
            Campagnes d’influence locales
          </p>
          <h1 className="mt-5 font-sans text-3xl font-thin leading-[1.08] tracking-wide text-espresso sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl">
            Transformez chaque scan
            <span className="block text-orange">en preuve sociale.</span>
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center md:justify-start">
            <Link
              to="/demarrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-all hover:bg-orange-dark hover:shadow-orange/40 sm:w-auto sm:px-8 sm:py-4"
            >
              Lancer mon restaurant
            </Link>
            <Link
              to="/connexion"
              className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white/70 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-espresso backdrop-blur-sm transition-colors hover:border-espresso/30 hover:bg-white sm:w-auto sm:px-8 sm:py-4"
            >
              Espace influenceur
            </Link>
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-warmgray/80 sm:mt-6 sm:text-xs">
            Sans app à installer pour vos clients · Mise en place en quelques minutes
          </p>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[min(100%,22rem)] overflow-hidden pb-2 sm:max-w-none md:mx-0 md:max-w-none md:justify-self-end md:pb-0">
          <SocialOrbitVisual />
        </div>
      </div>
    </section>
  );
}
