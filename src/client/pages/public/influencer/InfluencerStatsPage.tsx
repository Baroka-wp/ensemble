import { useInfluencerDashboard } from '../../../lib/influencerDashboard';
import { LiveScanToast } from '../../../components/LiveScanToast';
import { unlockAudio } from '../../../lib/notificationSound';
import { StatCard } from '../../../components/dashboard/StatCard';

export function InfluencerStatsPage() {
  const { statsQuery: query, lastScan } = useInfluencerDashboard();

  if (query.isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (query.error || !query.data) {
    return <p className="text-warmgray text-sm">Impossible de charger les statistiques.</p>;
  }

  const s = query.data;

  return (
    <section onClick={unlockAudio} className="max-w-4xl">
      <LiveScanToast scan={lastScan} variant="influencer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Aujourd’hui" scans={s.totals.scansToday} earnings={s.totals.earningsTodayXof} />
        <StatCard label="7 jours" scans={s.totals.scans7d} earnings={s.totals.earnings7dXof} />
        <StatCard label="30 jours" scans={s.totals.scans30d} earnings={s.totals.earnings30dXof} />
        <StatCard label="Total" scans={s.totals.scansCount} earnings={s.totals.earningsXof} highlight />
      </div>
    </section>
  );
}
