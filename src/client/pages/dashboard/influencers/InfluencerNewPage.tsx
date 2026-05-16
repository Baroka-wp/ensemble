import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import {
  createInfluencerInput,
  type CreateInfluencerInput,
  type InfluencerPublic,
} from '../../../../shared/schemas/influencer';
import { InfluencerForm, type InfluencerFormValues } from './InfluencerForm';

export function InfluencerNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: CreateInfluencerInput) =>
      apiFetch<{ influencer: InfluencerPublic }>('/admin/influencers', {
        method: 'POST',
        body: input,
        auth: true,
      }),
    onSuccess: ({ influencer }) => {
      qc.invalidateQueries({ queryKey: ['influencers'] });
      navigate(`/dashboard/influencers/${influencer.id}`, { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erreur inattendue'),
  });

  const onSubmit = (values: InfluencerFormValues) => {
    setError(null);
    if (!values.password) {
      setError('Mot de passe requis');
      return;
    }
    const parsed = createInfluencerInput.safeParse({
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      discountPercent: values.discountPercent,
      rewardPerScanXof: values.rewardPerScanXof,
      ...(values.code.length >= 4 ? { code: values.code } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <section className="max-w-xl mx-auto">
      <Link
        to="/dashboard/influencers"
        className="inline-block text-xs uppercase tracking-wider2 text-warmgray hover:text-terracotta mb-8"
      >
        ← Retour
      </Link>
      <InfluencerForm
        mode="create"
        submitLabel="Créer"
        isPending={mutation.isPending}
        error={error}
        onSubmit={onSubmit}
      />
    </section>
  );
}
