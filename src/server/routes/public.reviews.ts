import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { scanRateLimit } from '../middleware/scanRateLimit.js';
import { hashFingerprint } from '../lib/fingerprint.js';
import {
  createReviewInput,
  createFreeReviewInput,
  computeGlobal,
  PUBLIC_RANKING_MIN_REVIEWS,
  REVIEW_DELAY_MS,
  type PendingReviewCheck,
  type RestaurantPublicCard,
  type RestaurantPublicDetails,
  type ReviewPublic,
} from '../../shared/schemas/review.js';

export const publicReviewsRouter = Router();

const SLUG_RE = /^[a-z0-9-]{3,32}$/;

/**
 * POST /api/public/reviews
 * Crée un avis après visite. Vérifie :
 *  - le ticket existe et appartient à un scan
 *  - le fingerprint correspond au scan d'origine (anti-spoofing)
 *  - au moins REVIEW_DELAY_MS s'est écoulé depuis le scan
 *  - pas d'avis déjà donné par ce device pour ce resto
 */
publicReviewsRouter.post('/reviews', scanRateLimit, async (req, res) => {
  const input = createReviewInput.parse(req.body);
  const ticketCode = input.ticketCode.toUpperCase();
  const fingerprintHash = hashFingerprint(input.fingerprint);

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: { scan: { select: { id: true, restaurantId: true, fingerprintHash: true, createdAt: true } } },
  });
  if (!ticket) {
    throw new HttpError(404, 'TICKET_NOT_FOUND', 'Ticket introuvable');
  }

  // Anti-spoofing : le fingerprint qui soumet doit être celui qui a fait le scan d'origine.
  if (ticket.scan.fingerprintHash !== fingerprintHash) {
    throw new HttpError(403, 'FINGERPRINT_MISMATCH', 'Ce ticket appartient à un autre appareil');
  }

  const scanAge = Date.now() - ticket.scan.createdAt.getTime();
  if (scanAge < REVIEW_DELAY_MS) {
    const availableAt = new Date(ticket.scan.createdAt.getTime() + REVIEW_DELAY_MS);
    throw new HttpError(
      403,
      'TOO_EARLY',
      `Vous pourrez noter ce restaurant à partir de ${availableAt.toISOString()}`,
    );
  }

  try {
    const created = await prisma.review.create({
      data: {
        restaurantId: ticket.scan.restaurantId,
        scanId: ticket.scan.id,
        fingerprintHash,
        ratingAmbiance: input.ratingAmbiance,
        ratingTaste: input.ratingTaste,
        ratingService: input.ratingService,
        comment: input.comment && input.comment.length > 0 ? input.comment : null,
      },
    });
    res.status(201).json({
      review: {
        id: created.id,
        ratingAmbiance: created.ratingAmbiance,
        ratingTaste: created.ratingTaste,
        ratingService: created.ratingService,
        ratingGlobal: computeGlobal(
          created.ratingAmbiance,
          created.ratingTaste,
          created.ratingService,
        ),
        comment: created.comment,
        createdAt: created.createdAt.toISOString(),
      } satisfies ReviewPublic,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const target = (err.meta as { target?: string[] } | undefined)?.target;
      if (Array.isArray(target) && target.includes('scan_id')) {
        throw new HttpError(409, 'ALREADY_REVIEWED', 'Un avis a déjà été donné pour ce ticket');
      }
      throw new HttpError(409, 'ALREADY_REVIEWED', 'Vous avez déjà donné un avis pour ce restaurant');
    }
    throw err;
  }
});

/**
 * POST /api/public/restaurants/:slug/reviews
 * Avis libre : pas de ticket exigé. Le QR est physiquement en salle, donc avoir scanné le QR
 * (ce qui amène sur /s/:slug) est la preuve de visite suffisante pour ce MVP.
 * L'unicité (1 device = 1 avis par resto) reste garantie par la contrainte DB existante.
 */
publicReviewsRouter.post('/restaurants/:slug/reviews', scanRateLimit, async (req, res) => {
  const slug = req.params.slug ?? '';
  if (!SLUG_RE.test(slug)) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }
  const input = createFreeReviewInput.parse(req.body);
  const fingerprintHash = hashFingerprint(input.fingerprint);

  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, isActive: true },
    select: { id: true },
  });
  if (!restaurant) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }

  try {
    const created = await prisma.review.create({
      data: {
        restaurantId: restaurant.id,
        scanId: null,
        fingerprintHash,
        ratingAmbiance: input.ratingAmbiance,
        ratingTaste: input.ratingTaste,
        ratingService: input.ratingService,
        comment: input.comment && input.comment.length > 0 ? input.comment : null,
      },
    });
    res.status(201).json({
      review: {
        id: created.id,
        ratingAmbiance: created.ratingAmbiance,
        ratingTaste: created.ratingTaste,
        ratingService: created.ratingService,
        ratingGlobal: computeGlobal(
          created.ratingAmbiance,
          created.ratingTaste,
          created.ratingService,
        ),
        comment: created.comment,
        createdAt: created.createdAt.toISOString(),
      } satisfies ReviewPublic,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'ALREADY_REVIEWED', 'Vous avez déjà donné un avis pour ce restaurant');
    }
    throw err;
  }
});

/**
 * GET /api/public/tickets/:ticketCode/resolve
 * Renvoie le slug du restaurant lié à un ticketCode — utilisé par /a/:ticketCode
 * pour rediriger vers la bonne page d'avis sans connaître le slug à l'avance.
 */
publicReviewsRouter.get('/tickets/:ticketCode/resolve', async (req, res) => {
  const ticketCode = (req.params.ticketCode ?? '').toUpperCase().trim();
  if (!/^TKT-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(ticketCode)) {
    throw new HttpError(404, 'TICKET_NOT_FOUND', 'Ticket introuvable');
  }
  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    select: {
      scan: {
        select: {
          createdAt: true,
          restaurant: { select: { slug: true, name: true } },
        },
      },
    },
  });
  if (!ticket) {
    throw new HttpError(404, 'TICKET_NOT_FOUND', 'Ticket introuvable');
  }
  res.json({
    slug: ticket.scan.restaurant.slug,
    restaurantName: ticket.scan.restaurant.name,
    scanCreatedAt: ticket.scan.createdAt.toISOString(),
  });
});

/**
 * GET /api/public/restaurants/:slug/pending-review?ticketCode=TKT-XXXX-XXXX&fingerprint=...
 * Vérifie si le client peut donner un avis : appelée par le front avant d'afficher le bouton.
 */
publicReviewsRouter.get('/restaurants/:slug/pending-review', async (req, res) => {
  const slug = req.params.slug ?? '';
  const ticketCode = String(req.query.ticketCode ?? '').toUpperCase().trim();
  const fingerprint = String(req.query.fingerprint ?? '').trim();

  const respond = (body: PendingReviewCheck) => res.json(body);

  if (!SLUG_RE.test(slug)) return respond({ canReview: false, reason: 'restaurant_mismatch' });
  if (!/^TKT-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(ticketCode)) {
    return respond({ canReview: false, reason: 'ticket_not_found' });
  }
  if (fingerprint.length < 8) return respond({ canReview: false, reason: 'no_scan' });

  const fingerprintHash = hashFingerprint(fingerprint);

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: {
      scan: {
        select: {
          id: true,
          createdAt: true,
          fingerprintHash: true,
          restaurant: { select: { slug: true, id: true } },
        },
      },
    },
  });
  if (!ticket) return respond({ canReview: false, reason: 'ticket_not_found' });
  if (ticket.scan.restaurant.slug !== slug) {
    return respond({ canReview: false, reason: 'restaurant_mismatch' });
  }
  if (ticket.scan.fingerprintHash !== fingerprintHash) {
    return respond({ canReview: false, reason: 'no_scan' });
  }

  const alreadyReviewed = await prisma.review.findUnique({
    where: { scanId: ticket.scan.id },
    select: { id: true },
  });
  if (alreadyReviewed) return respond({ canReview: false, reason: 'already_reviewed' });

  const scanAge = Date.now() - ticket.scan.createdAt.getTime();
  if (scanAge < REVIEW_DELAY_MS) {
    return respond({
      canReview: false,
      reason: 'too_early',
      availableAt: new Date(ticket.scan.createdAt.getTime() + REVIEW_DELAY_MS).toISOString(),
    });
  }

  respond({ canReview: true, reason: 'ok' });
});

/**
 * GET /api/public/restaurants
 * Annuaire : restaurants actifs ayant ≥ PUBLIC_RANKING_MIN_REVIEWS avis non masqués,
 * triés par note globale décroissante. `search` filtre nom/slug (côté SQL).
 */
publicReviewsRouter.get('/restaurants', async (req, res) => {
  const search = String(req.query.search ?? '').trim().toLowerCase();
  const searchPattern = search.length > 0 ? `%${search}%` : null;

  // Requête unique : on agrège les notes par resto, on filtre min N avis publics et resto actif.
  const rows = await prisma.$queryRaw<
    {
      id: string;
      name: string;
      slug: string;
      count: bigint;
      avg_ambiance: number | null;
      avg_taste: number | null;
      avg_service: number | null;
      avg_global: number | null;
    }[]
  >(Prisma.sql`
    SELECT
      r.id,
      r.name,
      r.slug,
      COUNT(rv.id)                                                 AS count,
      AVG(rv.rating_ambiance)::float                               AS avg_ambiance,
      AVG(rv.rating_taste)::float                                  AS avg_taste,
      AVG(rv.rating_service)::float                                AS avg_service,
      AVG((rv.rating_ambiance + rv.rating_taste + rv.rating_service) / 3.0)::float AS avg_global
    FROM restaurants r
    -- Les notes d'avis dont le commentaire est masqué restent comptabilisées
    -- dans la moyenne publique (seul le texte est masqué, voir route détail).
    LEFT JOIN reviews rv ON rv.restaurant_id = r.id
    WHERE r.is_active = true
      ${searchPattern ? Prisma.sql`AND (LOWER(r.name) LIKE ${searchPattern} OR LOWER(r.slug) LIKE ${searchPattern})` : Prisma.empty}
    GROUP BY r.id, r.name, r.slug
    HAVING COUNT(rv.id) >= ${PUBLIC_RANKING_MIN_REVIEWS}
    ORDER BY avg_global DESC NULLS LAST, count DESC
    LIMIT 100
  `);

  const restaurants: RestaurantPublicCard[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    ratings:
      r.avg_global == null
        ? null
        : {
            count: Number(r.count),
            ratingAmbiance: Math.round((r.avg_ambiance ?? 0) * 10) / 10,
            ratingTaste: Math.round((r.avg_taste ?? 0) * 10) / 10,
            ratingService: Math.round((r.avg_service ?? 0) * 10) / 10,
            ratingGlobal: Math.round(r.avg_global * 10) / 10,
          },
  }));
  res.json({ restaurants });
});

/**
 * GET /api/public/restaurants/:slug/details
 * Détail public : agrégat de notes + 20 derniers avis (masqués affichent juste les notes).
 */
publicReviewsRouter.get('/restaurants/:slug/details', async (req, res) => {
  const slug = req.params.slug ?? '';
  if (!SLUG_RE.test(slug)) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true, slug: true },
  });
  if (!restaurant) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }

  const aggRows = await prisma.$queryRaw<
    {
      count: bigint;
      avg_ambiance: number | null;
      avg_taste: number | null;
      avg_service: number | null;
      avg_global: number | null;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*)                                                                   AS count,
      AVG(rating_ambiance)::float                                                AS avg_ambiance,
      AVG(rating_taste)::float                                                   AS avg_taste,
      AVG(rating_service)::float                                                 AS avg_service,
      AVG((rating_ambiance + rating_taste + rating_service) / 3.0)::float        AS avg_global
    FROM reviews
    -- Toutes les notes comptent dans la moyenne, même si le commentaire est masqué.
    WHERE restaurant_id = ${restaurant.id}::uuid
  `);
  const agg = aggRows[0]!;
  const count = Number(agg.count);

  // Liste des 20 derniers avis. Même quand un avis est masqué, on conserve les notes.
  const recent = await prisma.review.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      ratingAmbiance: true,
      ratingTaste: true,
      ratingService: true,
      comment: true,
      hiddenAt: true,
      createdAt: true,
    },
  });

  const body: RestaurantPublicDetails = {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    ratings:
      count >= PUBLIC_RANKING_MIN_REVIEWS && agg.avg_global != null
        ? {
            count,
            ratingAmbiance: Math.round((agg.avg_ambiance ?? 0) * 10) / 10,
            ratingTaste: Math.round((agg.avg_taste ?? 0) * 10) / 10,
            ratingService: Math.round((agg.avg_service ?? 0) * 10) / 10,
            ratingGlobal: Math.round(agg.avg_global * 10) / 10,
          }
        : null,
    reviews: recent.map(
      (r): ReviewPublic => ({
        id: r.id,
        ratingAmbiance: r.ratingAmbiance,
        ratingTaste: r.ratingTaste,
        ratingService: r.ratingService,
        ratingGlobal: computeGlobal(r.ratingAmbiance, r.ratingTaste, r.ratingService),
        // Si masqué, le commentaire disparaît mais les notes restent.
        comment: r.hiddenAt ? null : r.comment,
        createdAt: r.createdAt.toISOString(),
      }),
    ),
  };
  res.json(body);
});
