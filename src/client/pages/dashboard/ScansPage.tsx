import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import type { ScansPage as ScansPageData } from '../../../shared/schemas/admin';
import type { InfluencerPublic } from '../../../shared/schemas/influencer';
import { formatFCFA } from '../../../shared/schemas/influencer';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

const LIMIT = 20;

export function ScansPage() {
  const [page, setPage] = useState(1);
  const [influencerId, setInfluencerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const influencersQuery = useQuery({
    queryKey: ['influencers'],
    queryFn: () => apiFetch<{ influencers: InfluencerPublic[] }>('/admin/influencers', { auth: true }),
  });

  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (influencerId) params.set('influencerId', influencerId);
  if (from) params.set('from', new Date(from).toISOString());
  if (to) params.set('to', new Date(to).toISOString());

  const scansQuery = useQuery({
    queryKey: ['admin', 'scans', params.toString()],
    queryFn: () =>
      apiFetch<ScansPageData>(`/admin/scans?${params.toString()}`, { auth: true }),
  });

  return (
    <section>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Filter label="Influenceur">
          <select
            value={influencerId}
            onChange={(e) => {
              setInfluencerId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-deepspace/10 rounded-lg text-sm font-serif"
          >
            <option value="">Tous</option>
            {influencersQuery.data?.influencers.map((i) => (
              <option key={i.id} value={i.id}>
                {i.displayName} ({i.code})
              </option>
            ))}
          </select>
        </Filter>
        <Filter label="Du">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-deepspace/10 rounded-lg text-sm font-serif"
          />
        </Filter>
        <Filter label="Au">
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-deepspace/10 rounded-lg text-sm font-serif"
          />
        </Filter>
      </div>

      {scansQuery.isLoading && <p className="font-serif text-warmgray">Chargement…</p>}

      {scansQuery.data && (
        <>
          <div className="overflow-x-auto rounded-xl border border-deepspace/10 bg-white">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider2 text-warmgray">
                <tr className="border-b border-deepspace/5">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Influenceur</th>
                  <th className="text-left px-4 py-3">Ticket</th>
                  <th className="text-right px-4 py-3">Réduction</th>
                  <th className="text-right px-4 py-3">Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deepspace/5">
                {scansQuery.data.scans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center font-serif text-warmgray">
                      Aucun scan pour ces filtres.
                    </td>
                  </tr>
                )}
                {scansQuery.data.scans.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-serif text-warmgray whitespace-nowrap">
                      {formatDateTime(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/influencers/${s.influencer.id}`}
                        className="hover:underline underline-offset-4"
                      >
                        {s.influencer.displayName}
                      </Link>
                      <span className="ml-2 text-xs font-mono text-warmgray">{s.influencer.code}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{s.ticketCode ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{s.discountPercent} %</td>
                    <td className="px-4 py-3 text-right font-mono">{formatFCFA(s.rewardXof)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-warmgray">
              {scansQuery.data.total} scan{scansQuery.data.total > 1 ? 's' : ''} · page {scansQuery.data.page}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-full border border-deepspace/10 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!scansQuery.data.hasMore}
                className="px-3 py-1.5 rounded-full border border-deepspace/10 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider2 text-warmgray mb-1.5">{label}</span>
      {children}
    </label>
  );
}
