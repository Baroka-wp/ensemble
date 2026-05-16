import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { useClipboard } from '../../../lib/clipboard';
import { CollaborationStatusBadge } from '../../../components/CollaborationStatusBadge';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import type {
  CollaborationForRestaurant,
  CollaborationStatus,
} from '../../../../shared/schemas/collaboration';

type Tab = 'active' | 'pending' | 'inactive';

const TAB_FILTERS: Record<Tab, CollaborationStatus[]> = {
  active: ['active'],
  pending: ['pending'],
  inactive: ['paused_by_inf', 'paused_by_resto', 'rejected'],
};

export function CollaborationsListPage() {
  const [tab, setTab] = useState<Tab>('active');

  const { data: countsData } = useQuery({
    queryKey: ['admin', 'collaborations', 'counts'],
    queryFn: () =>
      apiFetch<{ counts: Record<CollaborationStatus, number> }>('/admin/collaborations/counts', {
        auth: true,
      }),
  });

  const counts = countsData?.counts;
  const pendingCount = counts?.pending ?? 0;
  const activeCount = counts?.active ?? 0;
  const inactiveCount =
    (counts?.paused_by_inf ?? 0) + (counts?.paused_by_resto ?? 0) + (counts?.rejected ?? 0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'collaborations', tab],
    queryFn: () =>
      apiFetch<{ collaborations: CollaborationForRestaurant[] }>(
        // Onglet "inactive" demande tous puis filtre côté client (l'API ne supporte qu'un statut).
        tab === 'inactive'
          ? '/admin/collaborations'
          : `/admin/collaborations?status=${TAB_FILTERS[tab][0]}`,
        { auth: true },
      ),
  });

  const list =
    data?.collaborations.filter((c) => TAB_FILTERS[tab].includes(c.status)) ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="inline-flex rounded-full border border-sand bg-white/80 p-1 text-xs">
          <TabButton current={tab} value="active" count={activeCount} onChange={setTab}>
            Actives
          </TabButton>
          <TabButton current={tab} value="pending" count={pendingCount} onChange={setTab} highlight={pendingCount > 0}>
            Demandes
          </TabButton>
          <TabButton current={tab} value="inactive" count={inactiveCount} onChange={setTab}>
            Inactives
          </TabButton>
        </nav>
        <Link
          to="/dashboard/collaborations/new"
          className="px-4 py-2 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark transition-colors shadow-sm shadow-orange/20"
        >
          + Nouveau
        </Link>
      </div>

      {isLoading && <p className="text-warmgray text-sm">Chargement…</p>}

      {!isLoading && list.length === 0 && (
        <div className="rounded-xl border border-dashed border-sand bg-white/60 p-8 text-center text-sm text-warmgray">
          {tab === 'pending'
            ? 'Aucune demande en attente.'
            : tab === 'active'
            ? 'Aucune collaboration active.'
            : 'Rien à afficher.'}
        </div>
      )}

      {list.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-4">
          {list.map((c) => (
            <CollaborationCard key={c.id} collab={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TabButton({
  current,
  value,
  count,
  highlight,
  onChange,
  children,
}: {
  current: Tab;
  value: Tab;
  count?: number;
  highlight?: boolean;
  onChange: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={[
        'px-3 py-1.5 rounded-full uppercase tracking-wider2 transition-colors flex items-center gap-1.5',
        active ? 'bg-espresso text-cream' : 'text-warmgray hover:text-espresso',
      ].join(' ')}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={[
            'inline-flex items-center justify-center text-[10px] min-w-[18px] px-1.5 py-0.5 rounded-full',
            active
              ? 'bg-cream/20 text-cream'
              : highlight
              ? 'bg-orange/15 text-orange'
              : 'bg-sand/80 text-warmgray',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CollaborationCard({ collab }: { collab: CollaborationForRestaurant }) {
  const { copy, copied } = useClipboard();
  const codeKey = `code-${collab.id}`;

  const subtitleParts = [];
  if (collab.discountPercent != null) subtitleParts.push(`${collab.discountPercent} %`);
  if (collab.rewardPerScanXof != null) subtitleParts.push(`${formatFCFA(collab.rewardPerScanXof)}/scan`);

  return (
    <li className="min-w-0 rounded-xl border border-sand/80 bg-white/90 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-sans text-lg text-espresso truncate">{collab.influencer.displayName}</h2>
          <p className="text-[11px] text-warmgray truncate">{collab.influencer.email}</p>
          {subtitleParts.length > 0 && (
            <p className="text-xs text-warmgray uppercase tracking-wider2 mt-1.5">
              {subtitleParts.join(' · ')}
            </p>
          )}
        </div>
        <Link
          to={`/dashboard/collaborations/${collab.id}`}
          className="text-xs uppercase tracking-wider2 text-terracotta hover:text-wine"
        >
          {collab.status === 'pending' ? 'Répondre' : 'Éditer'}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <code className="font-mono text-base px-3 py-1.5 rounded bg-mica border border-deepspace/10 select-all">
          {collab.code}
        </code>
        <button
          onClick={() => copy(collab.code, codeKey)}
          className="text-xs uppercase tracking-wider2 text-terracotta hover:text-wine"
        >
          {copied === codeKey ? 'Copié' : 'Copier'}
        </button>
        <div className="ml-auto">
          <CollaborationStatusBadge status={collab.status} perspective="restaurant" />
        </div>
      </div>
    </li>
  );
}
