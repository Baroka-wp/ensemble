import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import { useClipboard } from '../../../lib/clipboard';
import { CollaborationStatusBadge } from '../../../components/CollaborationStatusBadge';
import { Field, TextInput, PrimaryButton, ErrorBanner } from '../../auth/AuthLayout';
import { IconPause, IconPlay } from '../../../components/dashboard/icons';
import { formatFCFA } from '../../../../shared/schemas/influencer';
import {
  acceptCollaborationInput,
  updateCollaborationParamsInput,
  type CollaborationForRestaurant,
} from '../../../../shared/schemas/collaboration';

export function CollaborationEditPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { copy, copied } = useClipboard();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'collaboration', id],
    queryFn: () =>
      apiFetch<{ collaboration: CollaborationForRestaurant }>(`/admin/collaborations/${id}`, {
        auth: true,
      }),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'collaboration', id] });
    qc.invalidateQueries({ queryKey: ['admin', 'collaborations'] });
    qc.invalidateQueries({ queryKey: ['admin', 'collaborations', 'counts'] });
  };

  const acceptMut = useMutation({
    mutationFn: (input: { discountPercent: number; rewardPerScanXof: number }) =>
      apiFetch<{ collaboration: CollaborationForRestaurant }>(
        `/admin/collaborations/${id}/accept`,
        { method: 'POST', body: input, auth: true },
      ),
    onSuccess: invalidate,
  });
  const rejectMut = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/collaborations/${id}/reject`, { method: 'POST', auth: true }),
    onSuccess: () => {
      invalidate();
      navigate('/dashboard/collaborations', { replace: true });
    },
  });
  const pauseMut = useMutation({
    mutationFn: (action: 'pause' | 'resume') =>
      apiFetch(`/admin/collaborations/${id}/${action}`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });
  const regenMut = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/collaborations/${id}/regenerate-code`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });
  const paramsMut = useMutation({
    mutationFn: (input: { discountPercent?: number; rewardPerScanXof?: number }) =>
      apiFetch(`/admin/collaborations/${id}`, { method: 'PATCH', body: input, auth: true }),
    onSuccess: invalidate,
  });

  if (isLoading || !data) return <p className="text-warmgray text-sm">Chargement…</p>;
  const c = data.collaboration;

  return (
    <section className="max-w-2xl space-y-6">
      <div>
        <Link
          to="/dashboard/collaborations"
          className="inline-block text-xs uppercase tracking-wider2 text-warmgray hover:text-terracotta mb-6"
        >
          ← Retour
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-sans text-2xl text-espresso truncate">{c.influencer.displayName}</h1>
            <p className="text-sm text-warmgray truncate">{c.influencer.email}</p>
          </div>
          <CollaborationStatusBadge status={c.status} perspective="restaurant" />
        </div>
      </div>

      {c.status === 'pending' && (
        <AcceptCard
          onAccept={(v) => acceptMut.mutate(v)}
          onReject={() => {
            if (confirm('Refuser cette demande ? L’influenceur en sera informé.')) {
              rejectMut.mutate();
            }
          }}
          isAccepting={acceptMut.isPending}
          isRejecting={rejectMut.isPending}
          error={acceptMut.error instanceof ApiError ? acceptMut.error.message : null}
        />
      )}

      {(c.status === 'active' ||
        c.status === 'paused_by_inf' ||
        c.status === 'paused_by_resto') && (
        <>
          <ParamsCard
            discountPercent={c.discountPercent ?? 0}
            rewardPerScanXof={c.rewardPerScanXof ?? 0}
            isPending={paramsMut.isPending}
            error={paramsMut.error instanceof ApiError ? paramsMut.error.message : null}
            onSubmit={(v) => paramsMut.mutate(v)}
            saved={paramsMut.isSuccess && !paramsMut.isPending}
          />

          <div className="rounded-xl border border-sand/80 bg-white/90 p-5 shadow-sm space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-2">Code promo</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-base px-3 py-1.5 rounded bg-mica border border-deepspace/10 select-all">
                  {c.code}
                </code>
                <button
                  type="button"
                  onClick={() => copy(c.code, 'code')}
                  className="text-xs uppercase tracking-wider2 text-terracotta hover:text-wine"
                >
                  {copied === 'code' ? 'Copié' : 'Copier'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Régénérer le code ? L’ancien deviendra inutilisable.')) {
                      regenMut.mutate();
                    }
                  }}
                  disabled={regenMut.isPending}
                  className="text-xs uppercase tracking-wider2 text-warmgray hover:text-wine disabled:opacity-50"
                >
                  {regenMut.isPending ? 'Régénération…' : 'Régénérer'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-sand/60 flex flex-wrap items-center gap-2">
              {c.status === 'active' && (
                <button
                  type="button"
                  onClick={() => pauseMut.mutate('pause')}
                  disabled={pauseMut.isPending}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider2 text-warmgray hover:text-wine disabled:opacity-50"
                >
                  <IconPause className="h-3.5 w-3.5" />
                  Mettre en pause
                </button>
              )}
              {c.status === 'paused_by_resto' && (
                <button
                  type="button"
                  onClick={() => pauseMut.mutate('resume')}
                  disabled={pauseMut.isPending}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider2 text-warmgray hover:text-sage disabled:opacity-50"
                >
                  <IconPlay className="h-3.5 w-3.5" />
                  Réactiver
                </button>
              )}
              {c.status === 'paused_by_inf' && (
                <span className="text-xs text-warmgray italic">
                  L’influenceur a mis cette collaboration en pause
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {c.status === 'rejected' && (
        <div className="rounded-xl border border-wine/20 bg-wine/5 p-5 text-sm text-wine">
          Vous avez refusé cette demande de collaboration.
        </div>
      )}
    </section>
  );
}

function AcceptCard({
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
  error,
}: {
  onAccept: (v: { discountPercent: number; rewardPerScanXof: number }) => void;
  onReject: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
  error: string | null;
}) {
  const [discount, setDiscount] = useState('15');
  const [reward, setReward] = useState('500');
  const [formError, setFormError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsed = acceptCollaborationInput.safeParse({
      discountPercent: Number(discount),
      rewardPerScanXof: Number(reward),
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    onAccept(parsed.data);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-xl border border-halo/40 bg-halo/10 p-5 shadow-sm space-y-4"
    >
      <p className="text-sm text-espresso">
        Fixez la réduction proposée à vos clients et le gain versé à l’influenceur à chaque scan validé.
      </p>

      {(formError || error) && <ErrorBanner message={formError ?? error ?? ''} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Réduction client" hint="Entre 5 et 50 %.">
          <div className="relative">
            <TextInput
              type="number"
              min={5}
              max={50}
              step={1}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">%</span>
          </div>
        </Field>
        <Field label="Gain par scan" hint="En FCFA, montant entier.">
          <div className="relative">
            <TextInput
              type="number"
              min={0}
              max={50000}
              step={50}
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">FCFA</span>
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <PrimaryButton type="submit" disabled={isAccepting || isRejecting}>
          {isAccepting ? 'Acceptation…' : 'Accepter la demande'}
        </PrimaryButton>
        <button
          type="button"
          onClick={onReject}
          disabled={isAccepting || isRejecting}
          className="text-xs uppercase tracking-wider2 text-warmgray hover:text-wine disabled:opacity-50"
        >
          {isRejecting ? 'Refus…' : 'Refuser'}
        </button>
      </div>
    </form>
  );
}

function ParamsCard({
  discountPercent,
  rewardPerScanXof,
  isPending,
  error,
  saved,
  onSubmit,
}: {
  discountPercent: number;
  rewardPerScanXof: number;
  isPending: boolean;
  error: string | null;
  saved: boolean;
  onSubmit: (v: { discountPercent?: number; rewardPerScanXof?: number }) => void;
}) {
  const [discount, setDiscount] = useState(String(discountPercent));
  const [reward, setReward] = useState(String(rewardPerScanXof));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setDiscount(String(discountPercent));
    setReward(String(rewardPerScanXof));
  }, [discountPercent, rewardPerScanXof]);

  const dirty =
    Number(discount) !== discountPercent || Number(reward) !== rewardPerScanXof;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload: { discountPercent?: number; rewardPerScanXof?: number } = {};
    if (Number(discount) !== discountPercent) payload.discountPercent = Number(discount);
    if (Number(reward) !== rewardPerScanXof) payload.rewardPerScanXof = Number(reward);
    const parsed = updateCollaborationParamsInput.safeParse(payload);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    onSubmit(parsed.data);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-xl border border-sand/80 bg-white/90 p-5 shadow-sm space-y-4"
    >
      <div>
        <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-1">Paramètres</p>
        <p className="text-xs text-warmgray">
          Les scans existants conservent leurs valeurs au moment de leur enregistrement.
        </p>
      </div>

      {(formError || error) && <ErrorBanner message={formError ?? error ?? ''} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Réduction client">
          <div className="relative">
            <TextInput
              type="number"
              min={5}
              max={50}
              step={1}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">%</span>
          </div>
        </Field>
        <Field label="Gain par scan">
          <div className="relative">
            <TextInput
              type="number"
              min={0}
              max={50000}
              step={50}
              value={reward}
              onChange={(e) => setReward(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warmgray text-sm">FCFA</span>
          </div>
        </Field>
      </div>

      <p className="text-xs text-warmgray font-serif">
        Indicatif : 10 scans × {formatFCFA(Number(reward) || 0)} ={' '}
        {formatFCFA((Number(reward) || 0) * 10)}.
      </p>

      <div className="flex items-center gap-3">
        {dirty && (
          <PrimaryButton type="submit" disabled={isPending}>
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </PrimaryButton>
        )}
        {saved && !dirty && (
          <span className="text-xs uppercase tracking-wider2 text-sage">Modifications enregistrées</span>
        )}
      </div>
    </form>
  );
}
