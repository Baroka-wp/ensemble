import { z } from 'zod';

export const recentScan = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  rewardXof: z.number().int(),
});
export type RecentScan = z.infer<typeof recentScan>;

export const influencerStats = z.object({
  displayName: z.string(),
  code: z.string(),
  discountPercent: z.number().int(),
  rewardPerScan: z.object({
    amount: z.number().int(),
    currency: z.literal('XOF'),
  }),
  totals: z.object({
    scansCount: z.number().int(),
    earningsXof: z.number().int(),
    scansToday: z.number().int(),
    earningsTodayXof: z.number().int(),
    scans7d: z.number().int(),
    earnings7dXof: z.number().int(),
    scans30d: z.number().int(),
    earnings30dXof: z.number().int(),
  }),
  recentScans: z.array(recentScan),
});
export type InfluencerStats = z.infer<typeof influencerStats>;
