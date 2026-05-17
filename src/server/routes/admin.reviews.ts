import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { computeGlobal } from '../../shared/schemas/review.js';

export const adminReviewsRouter = Router();
adminReviewsRouter.use(requireAuth);

/**
 * GET /api/admin/reviews?page=&limit=&hidden=true|false
 * Liste paginée des avis du restaurant connecté.
 *  - Par défaut : visibles uniquement
 *  - hidden=true : seulement les masqués
 *  - hidden=all  : tous
 */
adminReviewsRouter.get('/', async (req, res) => {
  const restaurantId = req.restaurantId!;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const hidden = String(req.query.hidden ?? 'false');

  const where: Prisma.ReviewWhereInput = {
    restaurantId,
    ...(hidden === 'true'
      ? { hiddenAt: { not: null } }
      : hidden === 'all'
      ? {}
      : { hiddenAt: null }),
  };

  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.json({
    reviews: rows.map((r) => ({
      id: r.id,
      ratingAmbiance: r.ratingAmbiance,
      ratingTaste: r.ratingTaste,
      ratingService: r.ratingService,
      ratingGlobal: computeGlobal(r.ratingAmbiance, r.ratingTaste, r.ratingService),
      comment: r.comment,
      hidden: r.hiddenAt !== null,
      hiddenAt: r.hiddenAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    })),
    page,
    limit,
    total,
    hasMore: page * limit < total,
  });
});

/**
 * GET /api/admin/reviews/stats — agrégat pour le header du dashboard avis.
 * Renvoie : nb total visible, nb masqué, moyennes 3 critères + globale (sur visibles uniquement).
 */
adminReviewsRouter.get('/stats', async (req, res) => {
  const restaurantId = req.restaurantId!;

  const rows = await prisma.$queryRaw<
    {
      total_visible: bigint;
      total_hidden: bigint;
      avg_ambiance: number | null;
      avg_taste: number | null;
      avg_service: number | null;
      avg_global: number | null;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (WHERE hidden_at IS NULL)                                         AS total_visible,
      COUNT(*) FILTER (WHERE hidden_at IS NOT NULL)                                     AS total_hidden,
      AVG(rating_ambiance) FILTER (WHERE hidden_at IS NULL)::float                      AS avg_ambiance,
      AVG(rating_taste)    FILTER (WHERE hidden_at IS NULL)::float                      AS avg_taste,
      AVG(rating_service)  FILTER (WHERE hidden_at IS NULL)::float                      AS avg_service,
      AVG((rating_ambiance + rating_taste + rating_service) / 3.0) FILTER (WHERE hidden_at IS NULL)::float AS avg_global
    FROM reviews
    WHERE restaurant_id = ${restaurantId}::uuid
  `);
  const r = rows[0]!;

  res.json({
    totalVisible: Number(r.total_visible),
    totalHidden: Number(r.total_hidden),
    ratings:
      r.avg_global == null
        ? null
        : {
            count: Number(r.total_visible),
            ratingAmbiance: Math.round((r.avg_ambiance ?? 0) * 10) / 10,
            ratingTaste: Math.round((r.avg_taste ?? 0) * 10) / 10,
            ratingService: Math.round((r.avg_service ?? 0) * 10) / 10,
            ratingGlobal: Math.round(r.avg_global * 10) / 10,
          },
  });
});

async function ensureOwned(reviewId: string, restaurantId: string) {
  const r = await prisma.review.findFirst({ where: { id: reviewId, restaurantId } });
  if (!r) throw new HttpError(404, 'REVIEW_NOT_FOUND', 'Avis introuvable');
  return r;
}

/** POST /api/admin/reviews/:id/hide — masque le commentaire (notes conservées). */
adminReviewsRouter.post('/:id/hide', async (req, res) => {
  const review = await ensureOwned(req.params.id!, req.restaurantId!);
  if (review.hiddenAt) {
    res.json({ ok: true });
    return;
  }
  await prisma.review.update({
    where: { id: review.id },
    data: { hiddenAt: new Date() },
  });
  res.json({ ok: true });
});

/** POST /api/admin/reviews/:id/unhide — rétablit la visibilité du commentaire. */
adminReviewsRouter.post('/:id/unhide', async (req, res) => {
  const review = await ensureOwned(req.params.id!, req.restaurantId!);
  if (!review.hiddenAt) {
    res.json({ ok: true });
    return;
  }
  await prisma.review.update({
    where: { id: review.id },
    data: { hiddenAt: null },
  });
  res.json({ ok: true });
});
