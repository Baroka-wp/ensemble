const RESTAURANT_PROMISES = [
  {
    title: 'Pilotage en temps réel',
    body: 'Scans, codes actifs et performance par influenceur sur un seul dashboard.',
  },
  {
    title: 'Anti-abus intégré',
    body: 'Empreinte appareil : une réduction par client dans votre établissement, pour toujours.',
  },
  {
    title: 'QR permanent',
    body: 'Un seul QR en salle — tous vos partenaires partagent le même parcours client.',
  },
] as const;

const INFLUENCER_PROMISES = [
  {
    title: 'Code promo personnel',
    body: 'Votre audience utilise votre code en salle ; vous suivez scans et gains.',
  },
  {
    title: 'Gains transparents',
    body: 'Montant fixe par scan (FCFA), historique clair — sans tableur ni capture d’écran.',
  },
  {
    title: 'Espace dédié',
    body: 'Stats, liste des scans et code modifiable depuis votre espace influenceur.',
  },
] as const;

function PromiseCard({
  eyebrow,
  title,
  items,
  accent,
}: {
  eyebrow: string;
  title: string;
  items: readonly { title: string; body: string }[];
  accent: 'dark' | 'light';
}) {
  const isDark = accent === 'dark';
  return (
    <article
      className={[
        'rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12',
        isDark
          ? 'bg-espresso text-cream shadow-xl shadow-espresso/20'
          : 'border border-sand/80 bg-white/80 text-espresso shadow-lg shadow-orange/5 backdrop-blur-sm',
      ].join(' ')}
    >
      <p
        className={[
          'text-[10px] uppercase tracking-[0.25em]',
          isDark ? 'text-cream/45' : 'text-orange',
        ].join(' ')}
      >
        {eyebrow}
      </p>
      <h3 className="mt-3 font-sans text-2xl font-light tracking-wide md:text-3xl">{title}</h3>
      <ul className="mt-8 space-y-6">
        {items.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span
              className={[
                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                isDark ? 'bg-halo' : 'bg-orange',
              ].join(' ')}
              aria-hidden
            />
            <div>
              <p className={['font-sans text-base font-medium', isDark ? 'text-cream' : 'text-espresso'].join(' ')}>
                {item.title}
              </p>
              <p className={['mt-1 font-serif text-sm leading-relaxed', isDark ? 'text-cream/65' : 'text-warmgray'].join(' ')}>
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function PromisesSection() {
  return (
    <section id="promesses" className="scroll-mt-20 bg-gradient-to-b from-linen to-cream py-16 sm:scroll-mt-24 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-warmgray">Promesses produit</p>
          <h2 className="mt-3 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl">
            Deux espaces, une même mécanique fluide.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <PromiseCard
            eyebrow="Pour les restaurants"
            title="Maîtrisez chaque campagne."
            items={RESTAURANT_PROMISES}
            accent="dark"
          />
          <PromiseCard
            eyebrow="Pour les influenceurs"
            title="Monétisez votre audience locale."
            items={INFLUENCER_PROMISES}
            accent="light"
          />
        </div>
      </div>
    </section>
  );
}
