import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { formatFCFA, type InfluencerPublic } from '../../../../shared/schemas/influencer';
import { useClipboard } from '../../../lib/clipboard';

export function InfluencersListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['influencers'],
    queryFn: () => apiFetch<{ influencers: InfluencerPublic[] }>('/admin/influencers', { auth: true }),
  });
  const { copy, copied } = useClipboard();

  return (
    <section>
      <div className="flex justify-end mb-6">
        <Link
          to="/dashboard/influencers/new"
          className="px-4 py-2 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark transition-colors shadow-sm shadow-orange/20"
        >
          + Nouveau
        </Link>
      </div>

      {isLoading && <p className="font-serif text-warmgray">Chargement…</p>}
      {error && <p className="font-serif text-warmgray">Impossible de charger la liste.</p>}

      {data && data.influencers.length === 0 && (
        <div className="rounded-xl border border-deepspace/10 bg-white p-8 text-center">
          <p className="font-serif text-warmgray mb-4">Aucun influenceur pour l’instant.</p>
          <Link
            to="/dashboard/influencers/new"
            className="text-sm text-deepspace underline underline-offset-4"
          >
            Créer le premier
          </Link>
        </div>
      )}

      {data && data.influencers.length > 0 && (
        <ul className="grid sm:grid-cols-2 gap-4">
          {data.influencers.map((inf) => {
            const codeKey = `code-${inf.id}`;
            return (
              <li
                key={inf.id}
                className="min-w-0 rounded-xl border border-sand/80 bg-white/90 p-5 flex flex-col gap-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-sans text-lg truncate">{inf.displayName}</h2>
                    <p className="text-xs text-warmgray uppercase tracking-wider2 mt-0.5 flex items-center gap-1.5">
                      <span
                        className={[
                          'w-1.5 h-1.5 rounded-full',
                          inf.isActive ? 'bg-sage' : 'bg-warmgray/40',
                        ].join(' ')}
                      />
                      {inf.isActive ? 'Actif' : 'Inactif'} · {inf.discountPercent} % · {formatFCFA(inf.rewardPerScanXof)}/scan
                    </p>
                  </div>
                  <Link
                    to={`/dashboard/influencers/${inf.id}`}
                    className="text-xs uppercase tracking-wider2 text-terracotta hover:text-wine"
                  >
                    Éditer
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-base px-3 py-1.5 rounded bg-mica border border-deepspace/10 select-all">
                    {inf.code}
                  </code>
                  <button
                    onClick={() => copy(inf.code, codeKey)}
                    className="text-xs uppercase tracking-wider2 text-terracotta hover:text-wine"
                  >
                    {copied === codeKey ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <p className="text-xs text-warmgray font-serif truncate">
                  Connexion : <span className="font-mono">{inf.email}</span>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
