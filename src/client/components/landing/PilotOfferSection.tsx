import { PILOT_WHATSAPP_URL } from '../../lib/contact';

const DELIVERABLES = [
  'Votre espace et votre campagne configurés',
  'Un QR prêt à imprimer et poser en salle',
  'Jusqu’à 3 créateurs locaux intégrés',
  '30 jours de suivi et un bilan chiffré',
] as const;

export function PilotOfferSection() {
  return (
    <section id="offre" className="scroll-mt-24 bg-linen py-16 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-espresso text-cream shadow-2xl shadow-espresso/15 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative p-7 sm:p-10 md:p-14">
            <div
              className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-halo/10 blur-3xl"
              aria-hidden
            />
            <p className="relative text-[10px] uppercase tracking-[0.25em] text-halo">
              Offre pilote · août 2026
            </p>
            <h2 className="relative mt-4 max-w-xl font-sans text-3xl font-thin leading-tight tracking-wide sm:text-4xl md:text-5xl">
              Votre première campagne est lancée avec vous.
            </h2>
            <p className="relative mt-6 max-w-xl font-serif text-base leading-relaxed text-cream/70 sm:text-lg">
              Vous ne recevez pas un compte vide. Nous préparons la campagne, installons le QR,
              intégrons vos premiers créateurs et suivons les résultats pendant 30 jours.
            </p>

            <ul className="relative mt-9 grid gap-4 sm:grid-cols-2">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-cream/85">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-halo" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="flex flex-col justify-between bg-mica p-7 text-espresso sm:p-10 md:p-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-warmgray">
                Installation comprise
              </p>
              <p className="mt-5 font-mono text-4xl tabular-nums sm:text-5xl">125 000</p>
              <p className="mt-1 font-serif text-sm text-warmgray">FCFA · une seule fois</p>
              <p className="mt-7 border-l border-orange/40 pl-4 font-serif text-sm leading-relaxed text-warmgray">
                Cinq établissements maximum pour cette phase pilote. Le diagnostic de 20 minutes
                permet de vérifier si l’offre convient à votre salle.
              </p>
            </div>

            <div className="mt-10">
              <a
                href={PILOT_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-orange px-6 py-4 text-xs font-medium uppercase tracking-[0.18em] text-cream shadow-lg shadow-orange/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange active:translate-y-0"
              >
                Réserver le diagnostic
              </a>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-warmgray">
                Échange direct sur WhatsApp · aucun paiement avant validation du cadrage
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

