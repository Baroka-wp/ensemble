import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import { Field, TextInput, PrimaryButton, ErrorBanner } from '../../auth/AuthLayout';
import { PromoCodeField } from '../../../components/PromoCodeField';
import { createInfluencerInput, formatFCFA } from '../../../../shared/schemas/influencer';
import { normalizePromoCode } from '../../../../shared/promoCode';
import type { CollaborationForRestaurant } from '../../../../shared/schemas/collaboration';

export function CollaborationQuickCreatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discount, setDiscount] = useState('15');
  const [reward, setReward] = useState('500');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: {
      displayName: string;
      email: string;
      password: string;
      code?: string;
      discountPercent: number;
      rewardPerScanXof: number;
    }) =>
      apiFetch<{ collaboration: CollaborationForRestaurant }>(
        '/admin/collaborations/quick-create',
        { method: 'POST', body: input, auth: true },
      ),
    onSuccess: ({ collaboration }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'collaborations'] });
      qc.invalidateQueries({ queryKey: ['admin', 'collaborations', 'counts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      navigate(`/dashboard/collaborations/${collaboration.id}`, { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erreur inattendue'),
  });

  const rewardNum = Math.max(0, Math.round(Number(reward.replace(',', '.'))) || 0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const codeNormalized = code.trim() ? normalizePromoCode(code) : undefined;
    const parsed = createInfluencerInput.safeParse({
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
      discountPercent: Number(discount),
      rewardPerScanXof: rewardNum,
      ...(codeNormalized ? { code: codeNormalized } : {}),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <section className="max-w-2xl">
      <Link
        to="/dashboard/collaborations"
        className="inline-block text-xs uppercase tracking-wider2 text-warmgray hover:text-terracotta mb-6"
      >
        ← Retour
      </Link>

      <header className="mb-6">
        <h1 className="font-sans text-2xl text-espresso">Nouvelle collaboration</h1>
        <p className="text-sm text-warmgray mt-1">
          Créez directement un compte influenceur et la collaboration en un geste. Communiquez le mot de
          passe à l’influenceur. Il pourra modifier son code promo ensuite.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        noValidate
        className="rounded-xl border border-sand/80 bg-white/90 p-5 shadow-sm space-y-4"
      >
        {error && <ErrorBanner message={error} />}

        <Field label="Nom de l’influenceur">
          <TextInput
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Marie"
            required
          />
        </Field>

        <Field
          label="Code promo"
          hint="Laissez vide pour un code aléatoire."
        >
          <PromoCodeField value={code} onChange={setCode} disabled={mutation.isPending} />
        </Field>

        <Field label="Email" hint="Servira à l’influenceur pour se connecter à son espace.">
          <TextInput
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="marie@example.com"
            required
          />
        </Field>

        <Field label="Mot de passe initial" hint="8 caractères minimum. À communiquer à l’influenceur.">
          <TextInput
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

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

        {rewardNum > 0 && (
          <p className="text-sm text-warmgray font-serif">
            Indicatif : 10 scans × {formatFCFA(rewardNum)} = {formatFCFA(rewardNum * 10)}.
          </p>
        )}

        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Création…' : 'Créer la collaboration'}
        </PrimaryButton>
      </form>
    </section>
  );
}
