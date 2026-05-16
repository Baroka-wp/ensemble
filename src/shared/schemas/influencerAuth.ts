import { z } from 'zod';
import { promoCodeInput } from './influencer.js';

export const influencerLoginInput = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type InfluencerLoginInput = z.infer<typeof influencerLoginInput>;

export const influencerSession = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  code: z.string(),
  email: z.string().email(),
  restaurantName: z.string(),
  discountPercent: z.number().int(),
  rewardPerScanXof: z.number().int(),
  isActive: z.boolean(),
});
export type InfluencerSession = z.infer<typeof influencerSession>;

export const influencerAuthResponse = z.object({
  token: z.string(),
  influencer: influencerSession,
});
export type InfluencerAuthResponse = z.infer<typeof influencerAuthResponse>;

export const updateInfluencerCodeInput = z.object({
  code: promoCodeInput,
});
export type UpdateInfluencerCodeInput = z.infer<typeof updateInfluencerCodeInput>;
