import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, tokenStore } from '../../lib/api';
import { formatFCFA } from '../../../shared/schemas/influencer';
import type { AdminStats } from '../../../shared/schemas/admin';
import { useScanSocket } from '../../lib/useScanSocket';
import { LiveBadge, LiveScanToast } from '../../components/LiveScanToast';
import { unlockAudio } from '../../lib/notificationSound';
import { StatCard } from '../../components/dashboard/StatCard';
import { IconActivity, IconQr, IconUsers } from '../../components/dashboard/icons';

export function DashboardHome() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch<AdminStats>('/admin/stats', { auth: true }),
  });

  const token = tokenStore.get();
  const { connected, lastScan } = useScanSocket(
    token ? { kind: 'admin', token } : null,
    () => {
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      qc.invalidateQueries({ queryKey: ['admin', 'scans'] });
    },
  );

  return (
    <section onClick={unlockAudio} className="max-w-5xl">
      <div className="flex justify-end mb-4">
        <LiveBadge connected={connected} />
      </div>
      <LiveScanToast scan={lastScan} variant="admin" />

      {isLoading || !data ? (
        <p className="text-warmgray text-sm">Chargement…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <StatCard label="Aujourd’hui" scans={data.totals.scansToday} earnings={data.totals.earningsTodayXof} />
            <StatCard label="7 jours" scans={data.totals.scans7d} earnings={data.totals.earnings7dXof} />
            <StatCard label="30 jours" scans={data.totals.scans30d} earnings={data.totals.earnings30dXof} />
            <StatCard
              label="Total"
              scans={data.totals.scansAll}
              earnings={data.totals.earningsAllXof}
              highlight
            />
          </div>

          <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
            <QuickTile
              to="/dashboard/collaborations"
              icon={<IconUsers className="h-5 w-5" />}
              label="Collaborations"
              shortLabel="Collab."
            />
            <QuickTile to="/dashboard/scans" icon={<IconActivity className="h-5 w-5" />} label="Scans" />
            <QuickTile to="/dashboard/qr" icon={<IconQr className="h-5 w-5" />} label="QR" />
          </div>

          {data.topInfluencers.length > 0 && (
            <section>
              <h2 className="text-xs uppercase tracking-wider2 text-terracotta mb-3">Top influenceurs</h2>
              <ul className="rounded-xl border border-sand/80 bg-white/90 divide-y divide-sand/60 shadow-sm">
                {data.topInfluencers.map((inf, idx) => (
                  <li key={inf.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs text-terracotta w-4 text-right tabular-nums">{idx + 1}</span>
                    <Link
                      to="/dashboard/collaborations"
                      className="flex-1 min-w-0 truncate text-espresso hover:text-terracotta transition-colors"
                    >
                      {inf.displayName}
                      <span className="text-warmgray ml-2 font-mono text-xs">{inf.code}</span>
                    </Link>
                    <span className="font-mono text-espresso tabular-nums shrink-0">{formatFCFA(inf.earningsXof)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}

function QuickTile({
  to,
  icon,
  label,
  shortLabel,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  shortLabel?: string;
}) {
  const compact = shortLabel ?? label;

  return (
    <Link
      to={to}
      className="flex min-w-0 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-sand/80 bg-white/80 p-2.5 text-center transition-colors hover:border-terracotta/40 hover:bg-amber/10 sm:gap-2 sm:p-4"
    >
      <span className="shrink-0 text-terracotta">{icon}</span>
      <span className="w-full min-w-0 text-[10px] uppercase leading-tight tracking-wide text-espresso [overflow-wrap:anywhere] sm:hidden">
        {compact}
      </span>
      <span className="hidden w-full min-w-0 text-xs uppercase tracking-wider2 text-espresso sm:block">
        {label}
      </span>
    </Link>
  );
}
