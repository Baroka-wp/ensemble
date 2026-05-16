import { z } from 'zod';

export const adminStats = z.object({
  totals: z.object({
    scansToday: z.number().int(),
    earningsTodayXof: z.number().int(),
    scans7d: z.number().int(),
    earnings7dXof: z.number().int(),
    scans30d: z.number().int(),
    earnings30dXof: z.number().int(),
    scansAll: z.number().int(),
    earningsAllXof: z.number().int(),
  }),
  topInfluencers: z.array(
    z.object({
      id: z.string().uuid(),
      displayName: z.string(),
      code: z.string(),
      scansCount: z.number().int(),
      earningsXof: z.number().int(),
    }),
  ),
});
export type AdminStats = z.infer<typeof adminStats>;

export const scansQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  influencerId: z.string().uuid().optional(),
});
export type ScansQuery = z.infer<typeof scansQuery>;

export const scanListItem = z.object({
  id: z.string().uuid(),
  createdAt: z.string(),
  rewardXof: z.number().int(),
  discountPercent: z.number().int(),
  influencer: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    code: z.string(),
  }),
  ticketCode: z.string().nullable(),
});
export type ScanListItem = z.infer<typeof scanListItem>;

export const scansPage = z.object({
  scans: z.array(scanListItem),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});
export type ScansPage = z.infer<typeof scansPage>;

export const qrPayload = z.object({
  url: z.string().url(),
  pngBase64: z.string(),
  svg: z.string(),
});
export type QrPayload = z.infer<typeof qrPayload>;
