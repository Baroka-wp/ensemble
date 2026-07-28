import { Link } from 'react-router-dom';
import { useAudience } from './AudienceContext';
import { PILOT_WHATSAPP_URL } from '../../lib/contact';

const CONTENT = {
  restaurant: {
    eyebrow: 'Cinq places en août',
    title: 'Transformez une recommandation en visite mesurable.',
    sub:
      'Nous lançons la première campagne avec vous : configuration, QR, créateurs et bilan sur 30 jours.',
    primary: { label: 'Réserver le diagnostic', to: PILOT_WHATSAPP_URL },
    secondary: { label: 'Voir l’offre pilote', to: '#offre' },
  },
  influencer: {
    eyebrow: 'Inscription en 2 minutes',
    title: 'Transformez vos stories en revenus.',
    sub:
      'Créez votre compte, choisissez vos restaurants préférés, partagez votre code. Gratuit, sans seuil minimum d’abonnés.',
    primary: { label: 'Créer mon compte créateur', to: '/i/register' },
    secondary: { label: 'J’ai déjà un compte', to: '/i/login' },
  },
} as const;

export function CtaBand() {
  const { audience } = useAudience();
  const c = CONTENT[audience];

  return (
    <section className="relative overflow-hidden bg-cream py-16 sm:py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.16),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-5 md:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-white/80 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-orange shadow-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange" />
          </span>
          {c.eyebrow}
        </span>

        <h2
          key={`title-${audience}`}
          className="mt-6 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl lg:text-5xl animate-[fadeIn_0.3s_ease-out]"
        >
          {c.title}
        </h2>
        <p
          key={`sub-${audience}`}
          className="mx-auto mt-4 max-w-xl font-serif text-base text-warmgray sm:mt-5 sm:text-lg animate-[fadeIn_0.4s_ease-out]"
        >
          {c.sub}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {audience === 'restaurant' ? (
            <>
              <a
                href={c.primary.to}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-orange px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-all hover:-translate-y-0.5 hover:bg-orange-dark sm:w-auto"
              >
                {c.primary.label}
              </a>
              <a
                href={c.secondary.to}
                className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-espresso transition-colors hover:bg-white/90 sm:w-auto"
              >
                {c.secondary.label}
              </a>
            </>
          ) : (
            <>
              <Link
                to={c.primary.to}
                className="inline-flex w-full items-center justify-center rounded-full bg-orange px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-colors hover:bg-orange-dark sm:w-auto"
              >
                {c.primary.label}
              </Link>
              <Link
                to={c.secondary.to}
                className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-espresso transition-colors hover:bg-white/90 sm:w-auto"
              >
                {c.secondary.label}
              </Link>
            </>
          )}
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-warmgray/60">
          {audience === 'restaurant'
            ? 'Diagnostic de 20 minutes · lancement sous 48 h'
            : 'Compte créateur gratuit · sans seuil minimum'}
        </p>
      </div>
    </section>
  );
}
