import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { registerInput, type AuthResponse } from '../../../shared/schemas/auth';
import { AuthLayout, Field, TextInput, PrimaryButton, ErrorBanner } from './AuthLayout';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { restaurantName: string; email: string; password: string }) =>
      apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: input }),
    onSuccess: (data) => {
      login(data);
      navigate('/dashboard', { replace: true });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError(err.message);
      else setError('Erreur inattendue');
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = registerInput.safeParse({ restaurantName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Quelques secondes pour ouvrir votre espace."
      footer={
        <>
          Déjà inscrit ?{' '}
          <Link to="/login" className="text-orange hover:text-orange-dark underline underline-offset-4 transition-colors">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {error && <ErrorBanner message={error} />}
        <Field label="Nom du restaurant">
          <TextInput
            type="text"
            autoComplete="organization"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
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
          {mutation.isPending ? 'Création…' : 'Créer mon espace'}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
