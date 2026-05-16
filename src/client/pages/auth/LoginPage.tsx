import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { loginInput, type AuthResponse } from '../../../shared/schemas/auth';
import { AuthLayout, Field, TextInput, PrimaryButton, ErrorBanner } from './AuthLayout';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input }),
    onSuccess: (data) => {
      login(data);
      const redirect = (location.state as { from?: string } | null)?.from ?? '/dashboard';
      navigate(redirect, { replace: true });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError(err.message);
      else setError('Erreur inattendue');
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = loginInput.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Bonjour"
      subtitle="Connectez-vous à votre espace restaurant."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-orange hover:text-orange-dark underline underline-offset-4 transition-colors">
            Créer un compte
          </Link>
        </>
      }
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
