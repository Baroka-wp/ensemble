import { z } from 'zod';

/**
 * Délai minimum entre le scan et la possibilité de donner un avis.
 * Mis à 0 pour MVP : on laisse le client noter immédiatement, sinon il ne reviendra jamais.
 * Si on observe des abus (notes données sans consommer), on remettra un délai court.
 */
export const REVIEW_DELAY_MS = 0;

/** Validité du cookie ticket déposé sur le device après scan. */
export const REVIEW_COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Seuil minimum d'avis pour qu'un restaurant apparaisse dans le classement public. */
export const PUBLIC_RANKING_MIN_REVIEWS = 3;

const rating = z
  .number()
  .int('Note : nombre entier entre 1 et 5')
  .min(1, 'Note minimale : 1')
  .max(5, 'Note maximale : 5');

export const createReviewInput = z.object({
  ticketCode: z
    .string()
    .trim()
    .regex(/^TKT-[A-Z2-9]{4}-[A-Z2-9]{4}$/i, 'Code ticket invalide'),
  fingerprint: z.string().min(8, 'Empreinte invalide').max(256),
  ratingAmbiance: rating,
  ratingTaste: rating,
  ratingService: rating,
  comment: z.string().trim().max(1000, 'Commentaire : 1000 caractères maximum').optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewInput>;

/** Avis libre : pas de scan/ticket d'origine, l'identification se fait via le slug + fingerprint. */
export const createFreeReviewInput = z.object({
  fingerprint: z.string().min(8, 'Empreinte invalide').max(256),
  ratingAmbiance: rating,
  ratingTaste: rating,
  ratingService: rating,
  comment: z.string().trim().max(1000, 'Commentaire : 1000 caractères maximum').optional(),
});
export type CreateFreeReviewInput = z.infer<typeof createFreeReviewInput>;

/** Vue publique d'un avis : utilisée sur la page détail d'un restaurant. */
export const reviewPublic = z.object({
  id: z.string().uuid(),
  ratingAmbiance: z.number().int(),
  ratingTaste: z.number().int(),
  ratingService: z.number().int(),
  /** Moyenne arrondie à 1 décimale (calculée serveur). */
  ratingGlobal: z.number(),
  /** null si l'avis est masqué par le restaurant. */
  comment: z.string().nullable(),
  createdAt: z.string(),
});
export type ReviewPublic = z.infer<typeof reviewPublic>;

/** Agrégat de notes d'un restaurant (3 critères + global + nb). */
export const restaurantRatings = z.object({
  count: z.number().int(),
  ratingAmbiance: z.number(),
  ratingTaste: z.number(),
  ratingService: z.number(),
  ratingGlobal: z.number(),
});
export type RestaurantRatings = z.infer<typeof restaurantRatings>;

/** Carte d'un restaurant dans l'annuaire public. */
export const restaurantPublicCard = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  /** null si nb < PUBLIC_RANKING_MIN_REVIEWS. */
  ratings: restaurantRatings.nullable(),
});
export type RestaurantPublicCard = z.infer<typeof restaurantPublicCard>;

/** Détail d'un restaurant pour la page /restaurants/:slug. */
export const restaurantPublicDetails = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  ratings: restaurantRatings.nullable(),
  reviews: z.array(reviewPublic),
});
export type RestaurantPublicDetails = z.infer<typeof restaurantPublicDetails>;

/** Réponse de la vérif « ce client peut-il noter ce restaurant ? ». */
export const pendingReviewCheck = z.object({
  canReview: z.boolean(),
  reason: z
    .enum([
      'ok',
      'no_scan',
      'too_early',
      'already_reviewed',
      'ticket_not_found',
      'restaurant_mismatch',
    ])
    .optional(),
  /** Si too_early : timestamp ISO à partir duquel l'avis sera possible. */
  availableAt: z.string().optional(),
});
export type PendingReviewCheck = z.infer<typeof pendingReviewCheck>;

/** Vue admin d'un avis (côté restaurant). */
export const reviewAdmin = z.object({
  id: z.string().uuid(),
  ratingAmbiance: z.number().int(),
  ratingTaste: z.number().int(),
  ratingService: z.number().int(),
  ratingGlobal: z.number(),
  comment: z.string().nullable(),
  hidden: z.boolean(),
  hiddenAt: z.string().nullable(),
  createdAt: z.string(),
});
export type ReviewAdmin = z.infer<typeof reviewAdmin>;

export const reviewsAdminPage = z.object({
  reviews: z.array(reviewAdmin),
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});
export type ReviewsAdminPage = z.infer<typeof reviewsAdminPage>;

export const reviewsAdminStats = z.object({
  totalVisible: z.number().int(),
  totalHidden: z.number().int(),
  ratings: restaurantRatings.nullable(),
});
export type ReviewsAdminStats = z.infer<typeof reviewsAdminStats>;

/** Format d'une note moyenne pour affichage (ex: 4.3). */
export const formatRating = (n: number) => n.toFixed(1).replace('.', ',');

/** Moyenne des 3 critères. */
export const computeGlobal = (ambiance: number, taste: number, service: number) =>
  Math.round(((ambiance + taste + service) / 3) * 10) / 10;
