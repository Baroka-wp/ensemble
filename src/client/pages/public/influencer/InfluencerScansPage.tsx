import type { RecentScan } from '../../../../shared/schemas/stats';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import { useInfluencerDashboard } from '../../../lib/influencerDashboard';
import { LiveScanToast } from '../../../components/LiveScanToast';
import { unlockAudio } from '../../../lib/notificationSound';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function InfluencerScansPage() {
  const { statsQuery: query, lastScan } = useInfluencerDashboard();

  if (query.isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (query.error || !query.data) {
    return <p className="text-warmgray text-sm">Impossible de charger l’historique.</p>;
  }

  const scans = query.data.recentScans;

  return (
    <section onClick={unlockAudio} className="max-w-2xl">
      <LiveScanToast scan={lastScan} variant="influencer" />

      {scans.length === 0 ? (
        <p className="text-sm text-warmgray py-12 text-center rounded-xl border border-dashed border-sand/80 bg-white/50">
          Aucun scan pour l’instant.
        </p>
      ) : (
        <ul className="rounded-xl border border-sand/80 bg-white/90 divide-y divide-sand/60 shadow-sm overflow-hidden">
          {scans.map((scan: RecentScan) => (
            <li key={scan.id} className="px-4 py-3.5 flex items-center justify-between text-sm">
              <span className="text-warmgray tabular-nums">{formatDateTime(scan.createdAt)}</span>
              <span className="font-mono text-orange tabular-nums font-medium">+{formatFCFA(scan.rewardXof)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
