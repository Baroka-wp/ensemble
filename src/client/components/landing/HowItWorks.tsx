import { useAudience } from './AudienceContext';
import { DashboardMockup } from './mockups/DashboardMockup';
import { TicketMockup } from './mockups/TicketMockup';

const STEPS_RESTAURANT = [
  {
    step: '01',
    title: 'Vous créez votre espace',
    body: 'Email, mot de passe, nom du restaurant. Votre QR de salle est généré immédiatement.',
  },
  {
    step: '02',
    title: 'Les influenceurs vous trouvent',
    body: 'Ils envoient une demande de collaboration. Vous acceptez et fixez le gain par scan en FCFA.',
  },
  {
    step: '03',
    title: 'Vos clients scannent en salle',
    body: 'Ils saisissent un code, montrent leur ticket en caisse. Vous voyez tout en temps réel.',
  },
] as const;

const STEPS_INFLUENCER = [
  {
    step: '01',
    title: 'Vous créez votre compte',
    body: 'Email, mot de passe, nom. Pas de validation, pas de seuil minimum d’abonnés.',
  },
  {
    step: '02',
    title: 'Vous choisissez vos restos',
    body: 'Parcourez l’annuaire, envoyez vos demandes. Le restaurant valide et fixe votre gain par scan.',
  },
  {
    step: '03',
    title: 'Vous partagez, vous gagnez',
    body: 'Stories, bio, conversations. Chaque scan validé en caisse vous rapporte automatiquement.',
  },
] as const;

export function HowItWorks() {
  const { audience } = useAudience();
  const steps = audience === 'restaurant' ? STEPS_RESTAURANT : STEPS_INFLUENCER;
  const isResto = audience === 'restaurant';

  return (
    <section
      id="comment"
      className="scroll-mt-20 bg-cream py-16 sm:scroll-mt-24 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange">Comment ça marche</p>
          <h2 className="mt-3 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl">
            {isResto
              ? 'De l’inscription au premier ticket, en trois étapes.'
              : 'De l’inscription à votre premier gain, en trois étapes.'}
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ol key={audience} className="grid gap-4 sm:gap-5 animate-[fadeIn_0.4s_ease-out]">
            {steps.map((item, i) => (
              <li
                key={item.step}
                className="group relative rounded-3xl border border-sand/80 bg-white/60 p-6 transition-shadow hover:shadow-lg hover:shadow-espresso/5 sm:p-7"
              >
                <span className="font-mono text-xs text-orange/80">{item.step}</span>
                <h3 className="mt-3 font-sans text-lg font-light tracking-wide text-espresso sm:text-xl">
                  {item.title}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-warmgray sm:text-[15px]">
                  {item.body}
                </p>
                {i < steps.length - 1 && (
                  <span
                    className="absolute left-9 top-full h-4 w-px bg-gradient-to-b from-sand to-transparent"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>

          {/* Mockup à droite : ticket si resto (le résultat client final), dashboard si influenceur */}
          <div
            key={`mockup-${audience}`}
            className="mx-auto w-full max-w-md animate-[fadeIn_0.4s_ease-out]"
          >
            {isResto ? <TicketMockup /> : <DashboardMockup />}
          </div>
        </div>
      </div>
    </section>
  );
}
