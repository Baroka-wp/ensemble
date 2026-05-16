import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import { CollaborationStatusBadge } from '../../../components/CollaborationStatusBadge';
import type { RestaurantDirectoryItem } from '../../../../shared/schemas/collaboration';

export function InfluencerDiscoverPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ id: string; kind: 'ok' | 'error'; message: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['influencer-auth', 'discover'],
    queryFn: () =>
      apiFetch<{ restaurants: RestaurantDirectoryItem[] }>('/influencer-auth/discover', {
        auth: 'influencer',
      }),
  });

  const ask = useMutation({
    mutationFn: (restaurantId: string) =>
      apiFetch('/influencer-auth/collaborations', {
        method: 'POST',
        body: { restaurantId },
        auth: 'influencer',
      }),
    onSuccess: (_, restaurantId) => {
      setFeedback({ id: restaurantId, kind: 'ok', message: 'Demande envoyée' });
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'discover'] });
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'collaborations'] });
      setTimeout(() => navigate('/i/collaborations'), 600);
    },
    onError: (err, restaurantId) => {
      setFeedback({
        id: restaurantId,
        kind: 'error',
        message: err instanceof ApiError ? err.message : 'Erreur inattendue',
      });
    },
  });

  if (isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (error || !data) return <p className="text-warmgray text-sm">Impossible de charger.</p>;

  const filtered = data.restaurants.filter((r) =>
    search.trim() === ''
      ? true
      : r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="max-w-3xl space-y-5">
      <header>
        <h2 className="font-medium text-espresso text-base mb-1">Trouvez un restaurant</h2>
        <p className="text-sm text-warmgray">
          Sélectionnez un restaurant et envoyez-lui une demande de collaboration.
        </p>
      </header>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher par nom…"
        className="w-full px-4 py-3 bg-cream/50 border border-sand rounded-lg text-espresso placeholder:text-warmgray/60 focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/15 transition-colors font-serif"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-warmgray text-center py-12 rounded-xl border border-dashed border-sand bg-white/50">
          Aucun restaurant trouvé.
        </p>
      ) : (
        <ul className="rounded-xl border border-sand/80 bg-white/95 divide-y divide-sand/60 shadow-sm overflow-hidden">
          {filtered.map((r) => {
            const isAsking = ask.isPending && ask.variables === r.id;
            const fb = feedback?.id === r.id ? feedback : null;
            return (
              <li key={r.id} className="px-4 py-4 flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-espresso font-medium truncate">{r.name}</p>
                  <p className="text-[11px] text-warmgray truncate">scan.../{r.slug}</p>
                </div>

                {r.existingCollaborationStatus ? (
                  <CollaborationStatusBadge
                    status={r.existingCollaborationStatus}
                    perspective="influencer"
                  />
                ) : fb ? (
                  <span
                    className={[
                      'text-xs uppercase tracking-wider2',
                      fb.kind === 'ok' ? 'text-sage' : 'text-wine',
                    ].join(' ')}
                  >
                    {fb.message}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => ask.mutate(r.id)}
                    disabled={isAsking}
                    className="px-3 py-1.5 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark disabled:opacity-50 transition-colors"
                  >
                    {isAsking ? 'Envoi…' : 'Demander'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
