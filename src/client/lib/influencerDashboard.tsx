import { createContext, useContext, type ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { InfluencerStats } from '../../shared/schemas/stats';
import type { ScanCreatedEvent } from '../../shared/schemas/scan';
import { useInfluencerStats } from './useInfluencerStats';

type InfluencerDashboardContextValue = {
  statsQuery: UseQueryResult<InfluencerStats, Error>;
  connected: boolean;
  lastScan: ScanCreatedEvent | null;
};

const Ctx = createContext<InfluencerDashboardContextValue | null>(null);

export function InfluencerDashboardProvider({ children }: { children: ReactNode }) {
  const { query, connected, lastScan } = useInfluencerStats();
  return <Ctx.Provider value={{ statsQuery: query, connected, lastScan }}>{children}</Ctx.Provider>;
}

export function useInfluencerDashboard() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error('useInfluencerDashboard doit être utilisé dans <InfluencerDashboardProvider>');
  }
  return ctx;
}
