import { z } from 'zod';
import { promoCodeInput } from './influencer.js';

export const collaborationStatus = z.enum([
  'pending',
  'active',
  'rejected',
  'paused_by_inf',
  'paused_by_resto',
]);
export type CollaborationStatus = z.infer<typeof collaborationStatus>;

/** Vue côté influenceur de SES collaborations. */
export const collaborationForInfluencer = z.object({
  id: z.string().uuid(),
  status: collaborationStatus,
  code: z.string(),
  discountPercent: z.number().int().nullable(),
  rewardPerScanXof: z.number().int().nullable(),
  requestedAt: z.string(),
  decidedAt: z.string().nullable(),
  restaurant: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
});
export type CollaborationForInfluencer = z.infer<typeof collaborationForInfluencer>;

/** Vue côté restaurant de SES collaborations. */
export const collaborationForRestaurant = z.object({
  id: z.string().uuid(),
  status: collaborationStatus,
  code: z.string(),
  discountPercent: z.number().int().nullable(),
  rewardPerScanXof: z.number().int().nullable(),
  requestedAt: z.string(),
  decidedAt: z.string().nullable(),
  influencer: z.object({
    id: z.string().uuid(),
    displayName: z.string(),
    email: z.string().email(),
  }),
});
export type CollaborationForRestaurant = z.infer<typeof collaborationForRestaurant>;

/** Restaurant exposé dans l'annuaire pour l'influenceur. */
export const restaurantDirectoryItem = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  /** Statut éventuel d'une collab déjà existante entre cet influenceur et ce resto. */
  existingCollaborationStatus: collaborationStatus.nullable(),
});
export type RestaurantDirectoryItem = z.infer<typeof restaurantDirectoryItem>;

/** Inputs influenceur */
export const createCollaborationInput = z.object({
  restaurantId: z.string().uuid('Restaurant invalide'),
});
export type CreateCollaborationInput = z.infer<typeof createCollaborationInput>;

export const updateCollaborationCodeInput = z.object({
  code: promoCodeInput,
});
export type UpdateCollaborationCodeInput = z.infer<typeof updateCollaborationCodeInput>;

/** Action de cycle de vie (pause/resume) côté influenceur. */
export const influencerCollaborationAction = z.enum(['pause', 'resume']);
export type InfluencerCollaborationAction = z.infer<typeof influencerCollaborationAction>;

/** Inputs restaurant */
const DISCOUNT_MIN = 5;
const DISCOUNT_MAX = 50;
const REWARD_MAX_XOF = 50_000;

const discountPercent = z
  .number()
  .int('Réduction : nombre entier')
  .min(DISCOUNT_MIN, `Réduction minimale : ${DISCOUNT_MIN} %`)
  .max(DISCOUNT_MAX, `Réduction maximale : ${DISCOUNT_MAX} %`);

const rewardPerScanXof = z
  .number()
  .int('Gain : nombre entier (FCFA)')
  .nonnegative('Gain : valeur positive')
  .max(REWARD_MAX_XOF, `Gain maximal : ${REWARD_MAX_XOF.toLocaleString('fr-FR')} FCFA`);

export const acceptCollaborationInput = z.object({
  discountPercent,
  rewardPerScanXof,
});
export type AcceptCollaborationInput = z.infer<typeof acceptCollaborationInput>;

export const updateCollaborationParamsInput = z
  .object({
    discountPercent: discountPercent.optional(),
    rewardPerScanXof: rewardPerScanXof.optional(),
  })
  .refine((v) => v.discountPercent !== undefined || v.rewardPerScanXof !== undefined, {
    message: 'Au moins un champ requis',
  });
export type UpdateCollaborationParamsInput = z.infer<typeof updateCollaborationParamsInput>;

/** Action restaurant : accept (déjà au-dessus), reject, pause, resume. */
export const restaurantCollaborationAction = z.enum(['reject', 'pause', 'resume']);
export type RestaurantCollaborationAction = z.infer<typeof restaurantCollaborationAction>;
