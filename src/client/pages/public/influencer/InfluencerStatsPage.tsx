import { useInfluencerDashboard } from '../../../lib/influencerDashboard';
import { LiveScanToast } from '../../../components/LiveScanToast';
import { unlockAudio } from '../../../lib/notificationSound';
import { StatCard } from '../../../components/dashboard/StatCard';
import { formatFCFA } from '../../../../shared/schemas/influencer';

export function InfluencerStatsPage() {
  const { statsQuery: query, lastScan } = useInfluencerDashboard();

  if (query.isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (query.error || !query.data) {
    return <p className="text-warmgray text-sm">Impossible de charger les statistiques.</p>;
  }

  const s = query.data;

  return (
    <section onClick={unlockAudio} className="max-w-4xl space-y-8">
      <LiveScanToast scan={lastScan} variant="influencer" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Aujourd’hui" scans={s.totals.scansToday} earnings={s.totals.earningsTodayXof} />
        <StatCard label="7 jours" scans={s.totals.scans7d} earnings={s.totals.earnings7dXof} />
        <StatCard label="30 jours" scans={s.totals.scans30d} earnings={s.totals.earnings30dXof} />
        <StatCard label="Total" scans={s.totals.scansCount} earnings={s.totals.earningsXof} highlight />
      </div>

      <section>
        <h2 className="text-[10px] uppercase tracking-wider2 text-warmgray mb-3">
          Détail par collaboration
        </h2>
        {s.collaborations.length === 0 ? (
          <p className="text-sm text-warmgray text-center py-8 rounded-xl border border-dashed border-sand bg-white/50">
            Aucune collaboration pour le moment.
          </p>
        ) : (
          <ul className="rounded-xl border border-sand/80 bg-white/95 divide-y divide-sand/60 shadow-sm overflow-hidden">
            {s.collaborations.map((c) => (
              <li key={c.collaborationId} className="px-4 py-3.5 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-espresso font-medium truncate">{c.restaurantName}</p>
                  <p className="text-[11px] text-warmgray font-mono">{c.code}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-orange tabular-nums font-medium">{formatFCFA(c.earningsXof)}</p>
                  <p className="text-[11px] text-warmgray">{c.scansCount} scan{c.scansCount > 1 ? 's' : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
