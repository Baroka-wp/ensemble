const TESTIMONIALS = [
  {
    quote:
      'On a remplacé les flyers et les captures WhatsApp. En une soirée, je sais qui amène du monde et combien de tickets sont sortis.',
    name: 'Aïssa K.',
    role: 'Gérante — Maquis Le Baoulé, Abidjan',
    accent: 'restaurant',
  },
  {
    quote:
      'Mes abonnés scannent en terrasse avec mon code, je vois mes gains en direct sur mon tel. Ça vaut largement plus que les paniers offerts.',
    name: 'Awa D.',
    role: 'Créatrice food — 8k abonnés, Dakar',
    accent: 'influencer',
  },
  {
    quote:
      'Le ticket à l’écran, la caisse valide en deux secondes. Plus de codes papier perdus, plus d’histoires avec les serveurs.',
    name: 'Kossi M.',
    role: 'Chef de salle — Chez Maman Adjoa, Cotonou',
    accent: 'restaurant',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section
      id="temoignages"
      className="scroll-mt-20 bg-espresso py-16 text-cream sm:scroll-mt-24 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cream/45">Ils parlent de nous</p>
          <h2 className="mt-3 font-sans text-3xl font-thin tracking-wide md:text-4xl">
            Des restaurants et créateurs déjà en campagne.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col justify-between rounded-3xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-7"
            >
              <p className="font-serif text-base leading-relaxed text-cream/85">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-8 flex items-center gap-3 border-t border-white/8 pt-6">
                <span
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium uppercase',
                    t.accent === 'influencer' ? 'bg-orange/20 text-halo' : 'bg-cream/10 text-cream',
                  ].join(' ')}
                  aria-hidden
                >
                  {t.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </span>
                <div>
                  <cite className="not-italic font-sans text-sm text-cream">{t.name}</cite>
                  <p className="text-xs text-cream/45">{t.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
