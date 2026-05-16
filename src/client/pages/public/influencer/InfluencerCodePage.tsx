import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import { updateInfluencerCodeInput } from '../../../../shared/schemas/influencerAuth';
import { normalizePromoCode } from '../../../../shared/promoCode';
import { useInfluencerDashboard } from '../../../lib/influencerDashboard';
import { LiveScanToast } from '../../../components/LiveScanToast';
import { unlockAudio } from '../../../lib/notificationSound';
import { PromoCodeField } from '../../../components/PromoCodeField';
import { useClipboard } from '../../../lib/clipboard';

export function InfluencerCodePage() {
  const qc = useQueryClient();
  const { statsQuery: query, lastScan } = useInfluencerDashboard();
  const { copy, copied } = useClipboard();
  const [codeDraft, setCodeDraft] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSaved, setCodeSaved] = useState(false);

  const savedCode = query.data?.code ?? '';
  const codeDirty = normalizePromoCode(codeDraft) !== savedCode && codeDraft.length >= 4;

  useEffect(() => {
    if (query.data?.code) setCodeDraft(query.data.code);
  }, [query.data?.code]);

  const updateCode = useMutation({
    mutationFn: (code: string) =>
      apiFetch('/influencer-auth/code', { method: 'PATCH', body: { code }, auth: 'influencer' }),
    onSuccess: () => {
      setCodeError(null);
      setCodeSaved(true);
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'stats'] });
      qc.invalidateQueries({ queryKey: ['influencer-auth', 'me'] });
      setTimeout(() => setCodeSaved(false), 2500);
    },
    onError: (err) => {
      setCodeSaved(false);
      setCodeError(err instanceof ApiError ? err.message : 'Impossible de mettre à jour le code');
    },
  });

  const saveCode = () => {
    setCodeError(null);
    const parsed = updateInfluencerCodeInput.safeParse({ code: codeDraft });
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0]?.message ?? 'Code invalide');
      return;
    }
    updateCode.mutate(parsed.data.code);
  };

  if (query.isLoading) return <p className="text-warmgray text-sm">Chargement…</p>;
  if (query.error || !query.data) {
    return <p className="text-warmgray text-sm">Impossible de charger les données.</p>;
  }

  const s = query.data;

  return (
    <section onClick={unlockAudio} className="max-w-lg">
      <LiveScanToast scan={lastScan} variant="influencer" />

      <div className="rounded-xl border border-sand/80 bg-white/95 p-5 md:p-6 shadow-sm">
        <p className="text-sm text-sage mb-5">
          Partagez ce code à vos abonnés. Ils le saisissent après le scan du QR en salle.
        </p>

        <PromoCodeField
          value={codeDraft}
          onChange={(v) => {
            setCodeDraft(v);
            setCodeSaved(false);
          }}
          disabled={updateCode.isPending}
        />

        <p className="text-sm text-sage mt-4">
          −{s.discountPercent} % pour vos clients · {formatFCFA(s.rewardPerScan.amount)} par scan
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          {codeDirty && (
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
            onClick={() => copy(savedCode, 'promo')}
            className="text-xs uppercase tracking-wider2 text-warmgray hover:text-orange transition-colors"
          >
            {copied === 'promo' ? 'Copié' : 'Copier'}
          </button>
          {codeSaved && (
            <span className="text-xs text-sage uppercase tracking-wider2">Enregistré</span>
          )}
        </div>

        {codeError && <p className="mt-3 text-sm text-wine">{codeError}</p>}
      </div>
    </section>
  );
}
