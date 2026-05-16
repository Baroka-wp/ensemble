import { Link } from 'react-router-dom';

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.14),transparent_65%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <h2 className="font-sans text-3xl font-thin tracking-wide text-espresso md:text-4xl lg:text-5xl">
          Prêt à lancer votre première campagne ?
        </h2>
        <p className="mx-auto mt-5 max-w-lg font-serif text-lg text-warmgray">
          Créez votre espace, ajoutez vos influenceurs et affichez votre QR en salle dès aujourd’hui.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex w-full items-center justify-center rounded-full bg-orange px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-cream shadow-lg shadow-orange/30 transition-colors hover:bg-orange-dark sm:w-auto"
          >
            Créer mon restaurant
          </Link>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-full border border-espresso/15 bg-white px-10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-espresso transition-colors hover:bg-white/90 sm:w-auto"
          >
            J’ai déjà un compte
          </Link>
        </div>
      </div>
    </section>
  );
}
