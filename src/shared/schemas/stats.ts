import { z } from 'zod';

const periodTotals = z.object({
  scansCount: z.number().int(),
  earningsXof: z.number().int(),
  scansToday: z.number().int(),
  earningsTodayXof: z.number().int(),
  scans7d: z.number().int(),
  earnings7dXof: z.number().int(),
  scans30d: z.number().int(),
  earnings30dXof: z.number().int(),
});
export type PeriodTotals = z.infer<typeof periodTotals>;

export const recentScan = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  rewardXof: z.number().int(),
  /** Resto + code au moment du scan — pour situer la ligne quand l'influenceur a plusieurs collabs. */
  restaurantName: z.string(),
  influencerCode: z.string(),
});
export type RecentScan = z.infer<typeof recentScan>;

/** Une ligne du breakdown par collaboration active. */
export const collaborationStatsItem = z.object({
  collaborationId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  restaurantName: z.string(),
  restaurantSlug: z.string(),
  code: z.string(),
  discountPercent: z.number().int().nullable(),
  rewardPerScanXof: z.number().int().nullable(),
  scansCount: z.number().int(),
  earningsXof: z.number().int(),
});
export type CollaborationStatsItem = z.infer<typeof collaborationStatsItem>;

export const influencerStats = z.object({
  displayName: z.string(),
  totals: periodTotals,
  collaborations: z.array(collaborationStatsItem),
  recentScans: z.array(recentScan),
});
export type InfluencerStats = z.infer<typeof influencerStats>;
