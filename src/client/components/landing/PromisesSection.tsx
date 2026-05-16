const RESTAURANT = {
  eyebrow: 'Restaurant indépendant',
  title: 'Vous gérez 30 à 200 couverts.',
  pitch:
    'Vous avez essayé les flyers, les coupons WhatsApp, les codes papier. Vous voulez savoir exactement quel créateur ramène du monde et payer uniquement à la performance.',
  bullets: [
    {
      title: 'Pilotage en temps réel',
      body: 'Stats par campagne, par influenceur, par période — sur un dashboard mobile-first.',
    },
    {
      title: 'Anti-fraude intégré',
      body: 'Empreinte de l’appareil : un client ne peut obtenir qu’une seule réduction chez vous.',
    },
    {
      title: 'Vous fixez les règles',
      body: 'Vous validez chaque demande de collaboration et fixez le gain par scan en FCFA.',
    },
  ],
} as const;

const INFLUENCER = {
  eyebrow: 'Créateur food / lifestyle',
  title: 'Vous avez 1 000 à 50 000 abonnés.',
  pitch:
    'Vous recommandez vos restos préférés depuis longtemps. Vous voulez transformer ce trafic en revenus mesurables, sans tableurs ni captures d’écran.',
  bullets: [
    {
      title: 'Marketplace de restaurants',
      body: 'Parcourez l’annuaire et envoyez une demande de collaboration en un clic.',
    },
    {
      title: 'Code promo personnalisable',
      body: 'Votre propre code, modifiable, partagé sur vos stories ou en bio.',
    },
    {
      title: 'Gains transparents',
      body: 'Montant fixe en FCFA par scan validé, historique complet, mise à jour en direct.',
    },
  ],
} as const;

type PersonaData = {
  eyebrow: string;
  title: string;
  pitch: string;
  bullets: readonly { title: string; body: string }[];
};

function PersonaCard({
  data,
  accent,
}: {
  data: PersonaData;
  accent: 'dark' | 'light';
}) {
  const isDark = accent === 'dark';
  return (
    <article
      className={[
        'relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12',
        isDark
          ? 'bg-espresso text-cream shadow-xl shadow-espresso/20'
          : 'border border-sand/80 bg-white/80 text-espresso shadow-lg shadow-orange/5 backdrop-blur-sm',
      ].join(' ')}
    >
      <p
        className={[
          'text-[10px] uppercase tracking-[0.25em] mb-3',
          isDark ? 'text-halo/80' : 'text-orange',
        ].join(' ')}
      >
        {data.eyebrow}
      </p>
      <h3 className="font-sans text-2xl font-light tracking-wide md:text-3xl">{data.title}</h3>

      <p
        className={[
          'mt-5 font-serif text-sm leading-relaxed md:text-base',
          isDark ? 'text-cream/70' : 'text-warmgray',
        ].join(' ')}
      >
        {data.pitch}
      </p>

      <ul className="mt-8 space-y-5 border-t pt-6 sm:mt-10 sm:pt-8"
        style={{ borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(237,228,216,0.6)' }}>
        {data.bullets.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span
              className={[
                'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                isDark ? 'bg-halo' : 'bg-orange',
              ].join(' ')}
              aria-hidden
            />
            <div>
              <p
                className={[
                  'font-sans text-base font-medium',
                  isDark ? 'text-cream' : 'text-espresso',
                ].join(' ')}
              >
                {item.title}
              </p>
              <p
                className={[
                  'mt-1 font-serif text-sm leading-relaxed',
                  isDark ? 'text-cream/65' : 'text-warmgray',
                ].join(' ')}
              >
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
    <section
      id="promesses"
      className="scroll-mt-20 bg-gradient-to-b from-linen to-cream py-16 sm:scroll-mt-24 sm:py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-warmgray">À qui ça s’adresse</p>
          <h2 className="mt-3 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl">
            Deux profils, une même mécanique gagnant-gagnant.
          </h2>
          <p className="mt-4 font-serif text-warmgray sm:text-lg">
            Pas besoin d’une grosse audience ni d’un grand restaurant. Il suffit que ce soit local.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <PersonaCard data={RESTAURANT} accent="dark" />
          <PersonaCard data={INFLUENCER} accent="light" />
        </div>
      </div>
    </section>
  );
}
