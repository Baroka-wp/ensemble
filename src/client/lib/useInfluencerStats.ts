import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, influencerTokenStore } from './api';
import { useInfluencerAuth } from './influencerAuth';
import type { InfluencerStats } from '../../shared/schemas/stats';
import { useScanSocket } from './useScanSocket';

export function useInfluencerStats() {
  const { influencer } = useInfluencerAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['influencer-auth', 'stats'],
    queryFn: () => apiFetch<InfluencerStats>('/influencer-auth/stats', { auth: 'influencer' }),
    retry: false,
    refetchInterval: 60_000,
    enabled: Boolean(influencer),
  });

  const token = influencerTokenStore.get();
  const { connected, lastScan } = useScanSocket(
    token ? { kind: 'influencer', token } : null,
    () => qc.invalidateQueries({ queryKey: ['influencer-auth', 'stats'] }),
  );

  return { query, connected, lastScan, influencer };
}
