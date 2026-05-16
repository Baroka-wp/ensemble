import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { useInfluencerAuth } from '../../lib/influencerAuth';
import {
  influencerRegisterInput,
  type InfluencerAuthResponse,
} from '../../../shared/schemas/influencerAuth';
import { AuthLayout, Field, TextInput, PrimaryButton, ErrorBanner } from '../auth/AuthLayout';

export function InfluencerRegisterPage() {
  const navigate = useNavigate();
  const { login } = useInfluencerAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { displayName: string; email: string; password: string }) =>
      apiFetch<InfluencerAuthResponse>('/influencer-auth/register', {
        method: 'POST',
        body: input,
      }),
    onSuccess: (data) => {
      login(data);
      navigate('/i', { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erreur inattendue'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = influencerRegisterInput.safeParse({ displayName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Devenez influenceur"
      subtitle="Quelques secondes pour créer votre compte et trouver vos premiers restaurants."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link
            to="/i/login"
            className="text-orange hover:text-orange-dark underline underline-offset-4 transition-colors"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <ErrorBanner message={error} />}
        <Field label="Votre nom">
          <TextInput
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Marie Dupont"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Mot de passe" hint="8 caractères minimum.">
          <TextInput
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Création…' : 'Créer mon compte'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
