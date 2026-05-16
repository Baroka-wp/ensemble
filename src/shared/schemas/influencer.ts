import { z } from 'zod';
import { normalizePromoCode, PROMO_CODE_MAX, PROMO_CODE_MIN } from '../promoCode.js';

const DISCOUNT_MIN = 5;
const DISCOUNT_MAX = 50;
const REWARD_MAX_XOF = 50_000;

const displayName = z.string().trim().min(2, 'Nom : 2 caractères minimum').max(80, 'Nom trop long');
const email = z.string().trim().toLowerCase().email('Email invalide');
const password = z.string().min(8, 'Mot de passe : 8 caractères minimum').max(128, 'Mot de passe trop long');

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

export const promoCodeInput = z
  .string()
  .trim()
  .transform(normalizePromoCode)
  .pipe(
    z
      .string()
      .min(PROMO_CODE_MIN, `Code : ${PROMO_CODE_MIN} caractères minimum`)
      .max(PROMO_CODE_MAX, `Code : ${PROMO_CODE_MAX} caractères maximum`),
  );

export const createInfluencerInput = z.object({
  displayName,
  email,
  password,
  discountPercent,
  rewardPerScanXof,
  /** Omis ou vide côté client → génération automatique serveur */
  code: promoCodeInput.optional(),
});
export type CreateInfluencerInput = z.infer<typeof createInfluencerInput>;

export const updateInfluencerInput = z
  .object({
    displayName: displayName.optional(),
    email: email.optional(),
    password: password.optional(),
    discountPercent: discountPercent.optional(),
    rewardPerScanXof: rewardPerScanXof.optional(),
    isActive: z.boolean().optional(),
    code: promoCodeInput.optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Au moins un champ requis',
  });
export type UpdateInfluencerInput = z.infer<typeof updateInfluencerInput>;

export const influencerPublic = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  code: z.string(),
  email: z.string().email(),
  discountPercent: z.number().int(),
  rewardPerScanXof: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type InfluencerPublic = z.infer<typeof influencerPublic>;

// Formattage FCFA — pas de décimale, séparateur d'unités millier (espace insécable)
export const formatFCFA = (xof: number) =>
  `${new Intl.NumberFormat('fr-FR').format(xof)} FCFA`;
