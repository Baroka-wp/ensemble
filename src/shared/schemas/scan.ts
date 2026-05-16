import { z } from 'zod';

export const scanInput = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{3,32}$/, 'Slug invalide'),
  influencerCode: z
    .string()
    .trim()
    .min(3, 'Code trop court')
    .max(16, 'Code trop long'),
  fingerprint: z.string().min(8, 'Empreinte invalide').max(256),
});
export type ScanInput = z.infer<typeof scanInput>;

export const ticketPublic = z.object({
  code: z.string(),
  discountPercent: z.number().int(),
  restaurantName: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type TicketPublic = z.infer<typeof ticketPublic>;

export const restaurantPublicInfo = z.object({
  name: z.string(),
  slug: z.string(),
});
export type RestaurantPublicInfo = z.infer<typeof restaurantPublicInfo>;

// Payload Socket.io 'scan:created'
export interface ScanCreatedEvent {
  scanId: string;
  collaborationId: string;
  influencerId: string;
  influencerName: string;
  influencerCode: string;
  restaurantName: string;
  discountPercent: number;
  rewardXof: number;
  ticketCode: string;
  createdAt: string;
}

// Codes erreur §7.3 — exportés pour i18n côté client
export const SCAN_ERROR_CODES = {
  RESTAURANT_NOT_FOUND: 'Ce restaurant n’existe pas ou n’est plus accessible.',
  RESTAURANT_INACTIVE: 'Ce restaurant n’accepte plus de scans pour le moment.',
  INVALID_CODE: 'Ce code influenceur est invalide.',
  INFLUENCER_INACTIVE: 'Ce code n’est plus actif.',
  DEVICE_BLOCKED: 'Vous avez déjà utilisé votre réduction dans ce restaurant.',
  RATE_LIMITED: 'Trop de tentatives. Réessayez dans une minute.',
} as const;
export type ScanErrorCode = keyof typeof SCAN_ERROR_CODES;
