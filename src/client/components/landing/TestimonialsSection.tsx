const TESTIMONIALS = [
  {
    quote:
      'On a remplacé les codes papier et les DM. En une soirée, on voit qui amène du monde et combien de tickets sont sortis.',
    name: 'Camille R.',
    role: 'Gérante — Bistro du Marché',
    accent: 'restaurant',
  },
  {
    quote:
      'Mes abonnés scannent en terrasse avec mon code. Je check mes gains sur mon tel entre deux stories — c’est clair.',
    name: 'Yasmine K.',
    role: 'Créatrice food — Lyon',
    accent: 'influencer',
  },
  {
    quote:
      'Le ticket à l’écran, la caisse valide en deux secondes. Nos clients comprennent tout de suite, zéro friction.',
    name: 'Thomas M.',
    role: 'Chef de salle — Maison Lumière',
    accent: 'restaurant',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section id="temoignages" className="scroll-mt-20 bg-espresso py-16 text-cream sm:scroll-mt-24 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/45">Ils nous font confiance</p>
            <h2 className="mt-3 font-sans text-3xl font-thin tracking-wide md:text-4xl">
              La preuve sociale, en salle.
            </h2>
          </div>
          <p className="max-w-sm font-serif text-sm text-cream/55">
            Témoignages illustratifs — remplacez par vos retours clients dès les premières campagnes.
          </p>
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
