import { Link } from 'react-router-dom';
import { SocialOrbitVisual } from './SocialOrbitVisual';
import { AudienceSwitcher } from './AudienceSwitcher';
import { useAudience } from './AudienceContext';
import { TicketMockup } from './mockups/TicketMockup';
import { PILOT_WHATSAPP_URL } from '../../lib/contact';

const CONTENT = {
  restaurant: {
    badge: 'Campagne pilote · 5 établissements',
    h1Lead: 'Sachez enfin qui',
    h1Accent: 'vous ramène des clients.',
    cta: 'Réserver un diagnostic',
    ctaTo: PILOT_WHATSAPP_URL,
    altCta: 'Voir comment ça marche',
    altCtaTo: '#comment',
    bullets: ['Lancée avec vous en 48 h', 'Résultats suivis pendant 30 jours'],
  },
  influencer: {
    badge: 'Pour les créateurs',
    h1Lead: 'Recommandez vos restos préférés,',
    h1Accent: 'gagnez à chaque scan.',
    cta: 'Devenir influenceur',
    ctaTo: '/i/register',
    altCta: 'J’ai déjà un compte',
    altCtaTo: '/i/login',
    bullets: ['Gratuit, sans engagement', 'Suivi en temps réel de vos gains'],
  },
} as const;

export function HeroSection() {
  const { audience } = useAudience();
  const c = CONTENT[audience];

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:pt-8 sm:pb-20 md:pt-12 md:pb-28 lg:pb-32">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[min(520px,120vw)] w-[min(520px,120vw)] -translate-x-1/2 rounded-full bg-orange/20 blur-[100px] animate-float"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 h-48 w-48 rounded-full bg-terracotta/15 blur-3xl animate-float-delayed sm:-right-20 sm:top-40 sm:h-64 sm:w-64"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        {/* Switcher centré au-dessus du hero, accroche l'œil dès l'arrivée */}
        <div className="mb-10 flex justify-center md:mb-12">
          <AudienceSwitcher />
        </div>

        <div className="grid items-center gap-10 sm:gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
          <div className="text-center md:text-left">
            <p className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[9px] font-medium uppercase tracking-[0.18em] text-orange sm:text-[10px] sm:tracking-[0.2em] md:justify-start">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
              </span>
              {c.badge}
            </p>

            <h1
              key={audience}
              className="mt-5 font-sans text-3xl font-thin leading-[1.08] tracking-wide text-espresso sm:mt-6 sm:text-4xl md:text-5xl lg:text-[3.5rem] animate-[fadeIn_0.4s_ease-out]"
            >
              {c.h1Lead}
              <span className="block text-orange">{c.h1Accent}</span>
            </h1>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-center md:justify-start">
              {audience === 'restaurant' ? (
                <>
                  <a
                    href={c.ctaTo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-all hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-orange/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange sm:w-auto sm:px-8 sm:py-4"
                  >
                    {c.cta}
                  </a>
                  <a
                    href={c.altCtaTo}
                    className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white/70 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-espresso backdrop-blur-sm transition-colors hover:border-espresso/30 hover:bg-white sm:w-auto sm:px-8 sm:py-4"
                  >
                    {c.altCta}
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to={c.ctaTo}
                    className="inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-all hover:bg-orange-dark hover:shadow-orange/40 sm:w-auto sm:px-8 sm:py-4"
                  >
                    {c.cta}
                  </Link>
                  <Link
                    to={c.altCtaTo}
                    className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white/70 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-espresso backdrop-blur-sm transition-colors hover:border-espresso/30 hover:bg-white sm:w-auto sm:px-8 sm:py-4"
                  >
                    {c.altCta}
                  </Link>
                </>
              )}
            </div>

            <ul className="mt-6 flex flex-col items-center gap-1.5 text-[11px] leading-relaxed text-warmgray/80 sm:mt-7 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:text-xs md:justify-start">
              {c.bullets.map((b) => (
                <li key={b} className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-orange/60" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Visuel : orbit pour resto (réseau d'influenceurs), ticket mockup pour créateur */}
          <div className="relative z-10 mx-auto w-full max-w-[min(100%,22rem)] overflow-hidden pb-2 sm:max-w-none md:mx-0 md:max-w-none md:justify-self-end md:pb-0">
            {audience === 'restaurant' ? (
              <div key="orbit" className="animate-[fadeIn_0.4s_ease-out]">
                <SocialOrbitVisual />
              </div>
            ) : (
              <div key="ticket" className="animate-[fadeIn_0.4s_ease-out]">
                <TicketMockup />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
