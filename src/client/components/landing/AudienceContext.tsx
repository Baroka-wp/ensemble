import { createContext, useContext, useState, type ReactNode } from 'react';

export type Audience = 'restaurant' | 'influencer';

type AudienceContextValue = {
  audience: Audience;
  setAudience: (a: Audience) => void;
};

const Ctx = createContext<AudienceContextValue | null>(null);

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [audience, setAudience] = useState<Audience>('restaurant');
  return <Ctx.Provider value={{ audience, setAudience }}>{children}</Ctx.Provider>;
}

export function useAudience() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAudience doit être utilisé dans <AudienceProvider>');
  return ctx;
}
