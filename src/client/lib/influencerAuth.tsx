import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, influencerTokenStore, ApiError } from './api';
import type { InfluencerAuthResponse, InfluencerSession } from '../../shared/schemas/influencerAuth';

interface InfluencerAuthContextValue {
  influencer: InfluencerSession | null;
  isLoading: boolean;
  login: (data: InfluencerAuthResponse) => void;
  logout: () => void;
}

const Ctx = createContext<InfluencerAuthContextValue | null>(null);

export function InfluencerAuthProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState(() => Boolean(influencerTokenStore.get()));

  const meQuery = useQuery({
    queryKey: ['influencer-auth', 'me'],
    enabled: hasToken,
    queryFn: () => apiFetch<{ influencer: InfluencerSession }>('/influencer-auth/me', { auth: 'influencer' }),
    retry: false,
  });

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      influencerTokenStore.clear();
      setHasToken(false);
    }
  }, [meQuery.error]);

  const value = useMemo<InfluencerAuthContextValue>(
    () => ({
      influencer: hasToken ? meQuery.data?.influencer ?? null : null,
      isLoading: hasToken && meQuery.isLoading,
      login: (data) => {
        influencerTokenStore.set(data.token);
        setHasToken(true);
      },
      logout: () => {
        influencerTokenStore.clear();
        setHasToken(false);
      },
    }),
    [hasToken, meQuery.data, meQuery.isLoading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInfluencerAuth(): InfluencerAuthContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useInfluencerAuth doit être utilisé dans <InfluencerAuthProvider>');
  return ctx;
}

export function InfluencerAuthGuard({ children }: { children: ReactNode }) {
  const { influencer, isLoading } = useInfluencerAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-warmgray text-sm tracking-wider2 uppercase">Chargement…</p>
      </main>
    );
  }
  if (!influencer) {
    return <Navigate to="/i/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
