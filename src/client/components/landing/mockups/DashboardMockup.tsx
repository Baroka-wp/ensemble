/**
 * Reproduction stylisée du dashboard influenceur : 3 collabs avec scans + gains FCFA.
 */
const COLLABS = [
  { resto: 'Maquis Le Baoulé', code: 'AISSA7K', scans: 47, gains: 23_500, status: 'active' },
  { resto: 'Chez Maman Adjoa', code: 'AWAGOOD', scans: 22, gains: 11_000, status: 'active' },
  { resto: 'Brasserie Bélier', code: 'AWA250', scans: 8, gains: 2_400, status: 'pending' },
] as const;

function formatFCFA(n: number) {
  return `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;
}

export function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-orange/15 blur-3xl"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-2xl shadow-espresso/15">
        {/* Header espresso */}
        <div className="bg-espresso px-5 py-4 text-cream">
          <p className="text-[9px] uppercase tracking-wider2 text-cream/55">Espace influenceur</p>
          <p className="mt-0.5 font-sans text-sm font-medium">Awa Diop</p>
        </div>

        {/* Stat hero */}
        <div className="border-b border-sand/60 px-5 py-5 text-center">
          <p className="text-[9px] uppercase tracking-wider2 text-warmgray">Gains ce mois</p>
          <p className="mt-1 font-sans font-thin text-3xl text-orange tabular-nums">
            36 900 FCFA
          </p>
          <p className="mt-1 text-[10px] text-warmgray">77 scans validés</p>
        </div>

        {/* Liste collabs */}
        <ul className="divide-y divide-sand/60">
          {COLLABS.map((c) => (
            <li key={c.code} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-espresso font-medium">{c.resto}</p>
                <p className="text-[10px] font-mono text-warmgray">{c.code}</p>
              </div>
              {c.status === 'pending' ? (
                <span className="rounded-full border border-halo/60 bg-halo/20 px-2 py-0.5 text-[9px] uppercase tracking-wider2 text-espresso">
                  En attente
                </span>
              ) : (
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm text-orange tabular-nums font-medium">
                    {formatFCFA(c.gains)}
                  </p>
                  <p className="text-[10px] text-warmgray">
                    {c.scans} scan{c.scans > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Footer pour effet "il y a plus" */}
        <div className="border-t border-sand/60 px-5 py-2.5 text-center">
          <p className="text-[10px] text-warmgray italic">Mise à jour en direct</p>
        </div>
      </div>

      {/* Notif "Nouveau scan" qui flotte */}
      <div className="absolute -top-3 -right-3 sm:-right-4 rotate-3 rounded-full border border-orange/30 bg-white px-3 py-1.5 text-[10px] shadow-lg shadow-orange/20">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
          <span className="font-mono text-espresso">+500 FCFA</span>
        </span>
      </div>
    </div>
  );
}
