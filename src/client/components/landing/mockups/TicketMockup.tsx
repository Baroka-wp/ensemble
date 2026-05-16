/**
 * Reproduction stylisée du TicketScreen que reçoit le client après scan.
 * Pas de logique : c'est un aperçu visuel pour la landing.
 */
export function TicketMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Halo orange subtil derrière */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-orange/20 blur-3xl"
        aria-hidden
      />
      {/* Cadre type smartphone */}
      <div className="relative rounded-[2.25rem] border border-espresso/10 bg-cream/95 p-3 shadow-2xl shadow-espresso/15 backdrop-blur">
        {/* Encoche */}
        <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-espresso/15" aria-hidden />

        <div className="rounded-[1.75rem] bg-mica px-6 py-8 sm:px-7 sm:py-10 text-center">
          <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-3">Chez Aïssa</p>
          <p className="font-serif text-warmgray text-sm mb-1">Réduction</p>
          <p className="font-sans font-thin text-6xl sm:text-7xl tracking-wider2 text-orange leading-none mb-6">
            −20 %
          </p>

          <div className="rounded-xl border border-sand bg-cream/60 px-4 py-5 mb-5">
            <p className="text-[9px] uppercase tracking-wider2 text-warmgray mb-2">Code ticket</p>
            <p className="font-mono text-2xl sm:text-3xl text-espresso break-all leading-tight">
              TKT-A7K2-9PXR
            </p>
          </div>

          <p className="font-serif text-espresso text-sm">Montrez cet écran en caisse</p>
          <p className="font-serif text-warmgray text-[11px] mt-1">Valable 1 h</p>
        </div>

        {/* Indication "code influenceur" qui flotte au-dessus, façon receipt */}
        <div className="absolute -bottom-3 -right-2 rotate-3 rounded-2xl border border-orange/20 bg-white px-3 py-2 text-[10px] shadow-lg shadow-orange/10 sm:-right-4">
          <p className="uppercase tracking-wider2 text-warmgray">Code utilisé</p>
          <p className="font-mono text-espresso">MARIE7K</p>
        </div>
      </div>
    </div>
  );
}
