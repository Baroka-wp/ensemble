const STATS = [
  { value: '< 30 s', label: 'pour obtenir un ticket client' },
  { value: '100 %', label: 'des scans tracés & crédités' },
  { value: '0', label: 'app à installer en salle' },
] as const;

const LOGOS = ['Brasseries', 'Bistrots', 'Coffee shops', 'Tables locales', 'Rooftops'] as const;

export function SocialProofBar() {
  return (
    <section className="border-y border-sand/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-sans text-3xl font-thin tracking-wide text-espresso md:text-4xl">{stat.value}</p>
              <p className="mt-2 font-serif text-sm leading-snug text-warmgray">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-sand/50 pt-10">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-warmgray">
            Pensé pour la restauration indépendante
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="font-sans text-sm font-light tracking-widest text-espresso/35 uppercase"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
