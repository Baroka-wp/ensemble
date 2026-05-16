import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch, ApiError } from '../../../lib/api';
import { useClipboard } from '../../../lib/clipboard';
import { useInfluencerDashboard } from '../../../lib/influencerDashboard';
import { LiveScanToast } from '../../../components/LiveScanToast';
import { unlockAudio } from '../../../lib/notificationSound';
import { CollaborationStatusBadge } from '../../../components/CollaborationStatusBadge';
import { PromoCodeField } from '../../../components/PromoCodeField';
import { IconCompass, IconPause, IconPlay } from '../../../components/dashboard/icons';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import { normalizePromoCode } from '../../../../shared/promoCode';
import {
  updateCollaborationCodeInput,
  type CollaborationForInfluencer,
} from '../../../../shared/schemas/collaboration';

type Collab = CollaborationForInfluencer;

export function InfluencerCollaborationsPage() {
  const { lastScan } = useInfluencerDashboard();
  const { data, isLoading, error } = useQuery({
    queryKey: ['influencer-auth', 'collaborations'],
    queryFn: () =>
      apiFetch<{ collaborations: Collab[] }>('/influencer-auth/collaborations', {
        auth: 'influencer',
      }),
  });

  if (isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (error || !data) return <p className="text-warmgray text-sm">Impossible de charger.</p>;

  const collabs = data.collaborations;

  return (
    <section onClick={unlockAudio} className="max-w-3xl space-y-4">
      <LiveScanToast scan={lastScan} variant="influencer" />

      {collabs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sand bg-white/60 p-8 text-center">
          <p className="text-warmgray text-sm mb-4">
            Vous n’avez pas encore de collaboration. Trouvez un restaurant à qui proposer vos services.
          </p>
          <Link
            to="/i/discover"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark transition-colors"
          >
            <IconCompass className="h-4 w-4" />
            Découvrir les restaurants
          </Link>
        </div>
      ) : (
        collabs.map((c) => <CollaborationCard key={c.id} collab={c} />)
      )}
    </section>
  );
}

function CollaborationCard({ collab }: { collab: Collab }) {
  const qc = useQueryClient();
  const { copy, copied } = useClipboard();
  const [codeDraft, setCodeDraft] = useState(collab.code);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);

  const codeDirty =
    normalizePromoCode(codeDraft) !== collab.code && codeDraft.trim().length >= 4;
  const canEditCode = collab.status === 'active';
  const canPause = collab.status === 'active';
  const canResume = collab.status === 'paused_by_inf';
  const pausedByResto = collab.status === 'paused_by_resto';

  const updateCode = useMutation({
    mutationFn: (code: string) =>
      apiFetch(`/influencer-auth/collaborations/${collab.id}/code`, {
        method: 'PATCH',
        body: { code },
        auth: 'influencer',
      }),
    onSuccess: () => {
      setCodeError(null);
      setCodeSaved(true);
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'collaborations'] });
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'stats'] });
      setTimeout(() => setCodeSaved(false), 2500);
    },
    onError: (err) => {
      setCodeSaved(false);
      setCodeError(err instanceof ApiError ? err.message : 'Impossible de mettre à jour');
    },
  });

  const togglePause = useMutation({
    mutationFn: (action: 'pause' | 'resume') =>
      apiFetch(`/influencer-auth/collaborations/${collab.id}/${action}`, {
        method: 'POST',
        auth: 'influencer',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'collaborations'] });
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'stats'] });
    },
  });

  const saveCode = () => {
    setCodeError(null);
    const parsed = updateCollaborationCodeInput.safeParse({ code: codeDraft });
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0]?.message ?? 'Code invalide');
      return;
    }
    updateCode.mutate(parsed.data.code);
  };

  return (
    <article className="rounded-xl border border-sand/80 bg-white/95 p-5 md:p-6 shadow-sm">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-medium text-espresso text-base">{collab.restaurant.name}</h2>
          <p className="text-xs text-warmgray mt-0.5">scan.../{collab.restaurant.slug}</p>
        </div>
        <CollaborationStatusBadge status={collab.status} perspective="influencer" />
      </header>

      {collab.status === 'pending' && (
        <p className="text-sm text-sage italic">
          Votre demande est en attente de validation par le restaurant.
        </p>
      )}

      {collab.status === 'rejected' && (
        <p className="text-sm text-wine italic">
          Ce restaurant a refusé votre demande de collaboration.
        </p>
      )}

      {collab.status !== 'pending' && collab.status !== 'rejected' && (
        <>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-2">Code promo</p>
              <PromoCodeField
                value={codeDraft}
                onChange={(v) => {
                  setCodeDraft(v);
                  setCodeSaved(false);
                }}
                disabled={!canEditCode || updateCode.isPending}
              />
            </div>

            {collab.discountPercent != null && collab.rewardPerScanXof != null && (
              <p className="text-sm text-sage">
                −{collab.discountPercent} % pour vos clients · {formatFCFA(collab.rewardPerScanXof)} par scan validé
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {canEditCode && codeDirty && (
                <button
                  type="button"
                  onClick={saveCode}
                  disabled={updateCode.isPending}
                  className="px-4 py-2 rounded-full bg-orange text-cream text-xs uppercase tracking-wider2 hover:bg-orange-dark disabled:opacity-50 transition-colors"
                >
                  {updateCode.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              )}
              <button
                type="button"
                onClick={() => copy(collab.code, `code-${collab.id}`)}
                className="text-xs uppercase tracking-wider2 text-warmgray hover:text-orange transition-colors"
              >
                {copied === `code-${collab.id}` ? 'Copié' : 'Copier'}
              </button>
              {codeSaved && (
                <span className="text-xs text-sage uppercase tracking-wider2">Enregistré</span>
              )}

              <div className="ml-auto flex items-center gap-2">
                {canPause && (
                  <button
                    type="button"
                    onClick={() => togglePause.mutate('pause')}
                    disabled={togglePause.isPending}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider2 text-warmgray hover:text-wine transition-colors disabled:opacity-50"
                  >
                    <IconPause className="h-3.5 w-3.5" />
                    Mettre en pause
                  </button>
                )}
                {canResume && (
                  <button
                    type="button"
                    onClick={() => togglePause.mutate('resume')}
                    disabled={togglePause.isPending}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider2 text-warmgray hover:text-sage transition-colors disabled:opacity-50"
                  >
                    <IconPlay className="h-3.5 w-3.5" />
                    Réactiver
                  </button>
                )}
                {pausedByResto && (
                  <span className="text-xs text-warmgray italic">
                    Le restaurant a mis en pause cette collaboration
                  </span>
                )}
              </div>
            </div>

            {codeError && <p className="text-sm text-wine mt-2">{codeError}</p>}
          </div>
        </>
      )}
    </article>
  );
}
