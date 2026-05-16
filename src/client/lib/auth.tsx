import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, tokenStore, ApiError } from './api';
import type { AuthResponse, RestaurantPublic } from '../../shared/schemas/auth';

interface AuthContextValue {
  restaurant: RestaurantPublic | null;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState(() => Boolean(tokenStore.get()));

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    enabled: hasToken,
    queryFn: () => apiFetch<{ restaurant: RestaurantPublic }>('/auth/me', { auth: true }),
    retry: false,
  });

  useEffect(() => {
    if (meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      tokenStore.clear();
      setHasToken(false);
    }
  }, [meQuery.error]);

  const value = useMemo<AuthContextValue>(
    () => ({
      restaurant: hasToken ? meQuery.data?.restaurant ?? null : null,
      isLoading: hasToken && meQuery.isLoading,
      login: (data) => {
        tokenStore.set(data.token);
        setHasToken(true);
      },
      logout: () => {
        tokenStore.clear();
        setHasToken(false);
      },
    }),
    [hasToken, meQuery.data, meQuery.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>');
  return ctx;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { restaurant, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-warmgray text-sm tracking-wider2 uppercase">Chargement…</p>
      </main>
    );
  }
  if (!restaurant) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
