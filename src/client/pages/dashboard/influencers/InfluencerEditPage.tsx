import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import {
  updateInfluencerInput,
  type InfluencerPublic,
  type UpdateInfluencerInput,
} from '../../../../shared/schemas/influencer';
import { InfluencerForm, type InfluencerFormValues } from './InfluencerForm';

export function InfluencerEditPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['influencer', id],
    queryFn: () =>
      apiFetch<{ influencer: InfluencerPublic }>(`/admin/influencers/${id}`, { auth: true }),
    enabled: Boolean(id),
  });

  const update = useMutation({
    mutationFn: (input: UpdateInfluencerInput) =>
      apiFetch<{ influencer: InfluencerPublic }>(`/admin/influencers/${id}`, {
        method: 'PATCH',
        body: input,
        auth: true,
      }),
    onSuccess: ({ influencer }) => {
      qc.setQueryData(['influencer', id], { influencer });
      qc.invalidateQueries({ queryKey: ['influencers'] });
      setSavedAt(Date.now());
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erreur inattendue'),
  });

  if (isLoading || !data) {
    return <p className="font-serif text-warmgray">Chargement…</p>;
  }
  const inf = data.influencer;

  const onSubmit = (values: InfluencerFormValues) => {
    setError(null);
    const payload: UpdateInfluencerInput = {
      displayName: values.displayName,
      email: values.email,
      discountPercent: values.discountPercent,
      rewardPerScanXof: values.rewardPerScanXof,
      isActive: values.isActive,
    };
    if (values.password) payload.password = values.password;
    if (values.code !== inf.code) payload.code = values.code;

    const parsed = updateInfluencerInput.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    update.mutate(parsed.data);
  };

  return (
    <section className="max-w-2xl mx-auto">
      <Link
        to="/dashboard/influencers"
        className="inline-block text-xs uppercase tracking-wider2 text-warmgray hover:text-terracotta mb-8"
      >
        ← Retour
      </Link>

      {savedAt && (
        <p className="text-xs uppercase tracking-wider2 text-sage mb-4">Modifications enregistrées</p>
      )}

      <InfluencerForm
        initial={{
          displayName: inf.displayName,
          code: inf.code,
          email: inf.email,
          discountPercent: inf.discountPercent,
          rewardPerScanXof: inf.rewardPerScanXof,
          isActive: inf.isActive,
        }}
        mode="edit"
        submitLabel="Enregistrer"
        isPending={update.isPending}
        error={error}
        onSubmit={onSubmit}
      />
    </section>
  );
}
