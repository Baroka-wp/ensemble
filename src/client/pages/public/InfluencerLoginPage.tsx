import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { useInfluencerAuth } from '../../lib/influencerAuth';
import { influencerLoginInput, type InfluencerAuthResponse } from '../../../shared/schemas/influencerAuth';
import { AuthLayout, Field, TextInput, PrimaryButton, ErrorBanner } from '../auth/AuthLayout';

export function InfluencerLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useInfluencerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiFetch<InfluencerAuthResponse>('/influencer-auth/login', { method: 'POST', body: input }),
    onSuccess: (data) => {
      login(data);
      const redirect = (location.state as { from?: string } | null)?.from ?? '/i';
      navigate(redirect === '/i/login' ? '/i/code' : redirect, { replace: true });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : 'Erreur inattendue'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = influencerLoginInput.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Espace influenceur"
      subtitle="Connectez-vous pour consulter vos scans et gains."
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <ErrorBanner message={error} />}
        <Field label="Email">
          <TextInput
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Mot de passe">
          <TextInput
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Connexion…' : 'Se connecter'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
