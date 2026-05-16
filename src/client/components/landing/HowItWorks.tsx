const STEPS = [
  {
    step: '01',
    title: 'Le restaurant active son QR',
    body: 'Créez vos codes créateurs, imprimez le QR de salle et partagez les liens à votre communauté locale.',
  },
  {
    step: '02',
    title: 'Le client scanne & saisit le code',
    body: 'En quelques secondes, il obtient un ticket de réduction unique à montrer en caisse — sans télécharger d’app.',
  },
  {
    step: '03',
    title: 'L’influenceur est crédité',
    body: 'Chaque scan valide alimente les stats en direct et le gain fixe (FCFA) du partenaire, sans calcul manuel.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="comment" className="scroll-mt-24 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.25em] text-orange">Comment ça marche</p>
          <h2 className="mt-3 font-sans text-3xl font-thin tracking-wide text-espresso md:text-4xl">
            Du QR au ticket, en trois étapes.
          </h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {STEPS.map((item, i) => (
            <li
              key={item.step}
              className="group relative rounded-3xl border border-sand/80 bg-white/60 p-8 transition-shadow hover:shadow-lg hover:shadow-espresso/5"
            >
              <span className="font-mono text-xs text-orange/80">{item.step}</span>
              <h3 className="mt-4 font-sans text-xl font-light tracking-wide text-espresso">{item.title}</h3>
              <p className="mt-3 font-serif text-sm leading-relaxed text-warmgray">{item.body}</p>
              {i < STEPS.length - 1 && (
                <span
                  className="absolute -right-3 top-1/2 hidden h-px w-6 bg-gradient-to-r from-sand to-transparent md:block"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
