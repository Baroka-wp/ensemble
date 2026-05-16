import { Router } from 'express';
import type { Collaboration, Restaurant } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireInfluencerAuth } from '../middleware/requireAuth.js';
import { generateUniqueCode, assertCodeAvailable, isUniqueViolation } from '../lib/promoCode.js';
import {
  createCollaborationInput,
  updateCollaborationCodeInput,
  type CollaborationForInfluencer,
  type RestaurantDirectoryItem,
} from '../../shared/schemas/collaboration.js';
import type { InfluencerStats, RecentScan } from '../../shared/schemas/stats.js';

export const influencerCollaborationsRouter = Router();
influencerCollaborationsRouter.use(requireInfluencerAuth);

type CollabWithResto = Collaboration & {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'slug'>;
};

function toForInfluencer(c: CollabWithResto): CollaborationForInfluencer {
  return {
    id: c.id,
    status: c.status,
    code: c.code,
    discountPercent: c.discountPercent,
    rewardPerScanXof: c.rewardPerScanXof,
    requestedAt: c.requestedAt.toISOString(),
    decidedAt: c.decidedAt?.toISOString() ?? null,
    restaurant: c.restaurant,
  };
}

// GET /api/influencer-auth/collaborations — mes collaborations (tous statuts)
influencerCollaborationsRouter.get('/collaborations', async (req, res) => {
  const list = await prisma.collaboration.findMany({
    where: { influencerId: req.influencerId! },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ status: 'asc' }, { requestedAt: 'desc' }],
  });
  res.json({ collaborations: list.map(toForInfluencer) });
});

// POST /api/influencer-auth/collaborations — demander une collab à un restaurant
influencerCollaborationsRouter.post('/collaborations', async (req, res) => {
  const { restaurantId } = createCollaborationInput.parse(req.body);
  const influencerId = req.influencerId!;

  // Le resto doit exister et être actif.
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, isActive: true },
    select: { id: true, name: true, slug: true },
  });
  if (!restaurant) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }

  // Une collab (n'importe quel statut) existante bloque (contrainte uniq_collaboration_pair).
  const existing = await prisma.collaboration.findUnique({
    where: { uniq_collaboration_pair: { influencerId, restaurantId } },
    select: { id: true, status: true },
  });
  if (existing) {
    throw new HttpError(
      409,
      'COLLABORATION_EXISTS',
      `Vous avez déjà une demande ${existing.status} avec ce restaurant`,
    );
  }

  // Code provisoire généré ici — l'influenceur peut le changer plus tard, après acceptation.
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = await generateUniqueCode(restaurantId);
    try {
      const created = await prisma.collaboration.create({
        data: {
          influencerId,
          restaurantId,
          code,
          status: 'pending',
        },
        include: { restaurant: { select: { id: true, name: true, slug: true } } },
      });
      res.status(201).json({ collaboration: toForInfluencer(created) });
      return;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      // Collision improbable (le code venait d'être validé libre) — on retente.
    }
  }
  throw new HttpError(500, 'CODE_COLLISION', 'Impossible de générer un code unique');
});

async function ensureOwned(collaborationId: string, influencerId: string): Promise<CollabWithResto> {
  const c = await prisma.collaboration.findFirst({
    where: { id: collaborationId, influencerId },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
  });
  if (!c) throw new HttpError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration introuvable');
  return c;
}

// PATCH /api/influencer-auth/collaborations/:id/code — modifier mon code promo
influencerCollaborationsRouter.patch('/collaborations/:id/code', async (req, res) => {
  const { code } = updateCollaborationCodeInput.parse(req.body);
  const collab = await ensureOwned(req.params.id!, req.influencerId!);

  // Seul autorisé quand la collab est active (sinon le code n'est pas utilisable au scan de toute façon).
  if (collab.status !== 'active') {
    throw new HttpError(403, 'COLLABORATION_NOT_ACTIVE', 'Cette collaboration n’est pas active');
  }
  if (code === collab.code) {
    res.json({ collaboration: toForInfluencer(collab) });
    return;
  }
  await assertCodeAvailable(collab.restaurantId, code, collab.id);

  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { code },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
  });
  res.json({ collaboration: toForInfluencer(updated) });
});

// POST /api/influencer-auth/collaborations/:id/pause — mettre en pause de mon côté
influencerCollaborationsRouter.post('/collaborations/:id/pause', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.influencerId!);
  if (collab.status !== 'active') {
    throw new HttpError(403, 'COLLABORATION_NOT_ACTIVE', 'Seule une collaboration active peut être mise en pause');
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: 'paused_by_inf' },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
  });
  res.json({ collaboration: toForInfluencer(updated) });
});

// POST /api/influencer-auth/collaborations/:id/resume — réactiver (seulement si paused_by_inf)
influencerCollaborationsRouter.post('/collaborations/:id/resume', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.influencerId!);
  if (collab.status !== 'paused_by_inf') {
    throw new HttpError(
      403,
      'CANNOT_RESUME',
      collab.status === 'paused_by_resto'
        ? 'Le restaurant a mis cette collaboration en pause'
        : 'Cette collaboration ne peut pas être réactivée',
    );
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: 'active' },
    include: { restaurant: { select: { id: true, name: true, slug: true } } },
  });
  res.json({ collaboration: toForInfluencer(updated) });
});

// GET /api/influencer-auth/stats — totaux + breakdown par collaboration + 20 derniers scans
influencerCollaborationsRouter.get('/stats', async (req, res) => {
  const influencerId = req.influencerId!;

  const inf = await prisma.influencer.findUnique({
    where: { id: influencerId },
    select: { displayName: true },
  });
  if (!inf) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }

  // Totaux agrégés sur toutes les collabs de cet influenceur (via JOIN scans → collaborations).
  const aggRows = await prisma.$queryRaw<
    {
      scans_count: bigint;
      earnings_xof: bigint | null;
      scans_today: bigint;
      earnings_today_xof: bigint | null;
      scans_7d: bigint;
      earnings_7d_xof: bigint | null;
      scans_30d: bigint;
      earnings_30d_xof: bigint | null;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*)                                                              AS scans_count,
      COALESCE(SUM(s.reward_xof), 0)                                        AS earnings_xof,
      COUNT(*) FILTER (WHERE s.created_at >= date_trunc('day', now()))      AS scans_today,
      COALESCE(SUM(s.reward_xof) FILTER (WHERE s.created_at >= date_trunc('day', now())), 0) AS earnings_today_xof,
      COUNT(*) FILTER (WHERE s.created_at >= now() - interval '7 days')     AS scans_7d,
      COALESCE(SUM(s.reward_xof) FILTER (WHERE s.created_at >= now() - interval '7 days'), 0)  AS earnings_7d_xof,
      COUNT(*) FILTER (WHERE s.created_at >= now() - interval '30 days')    AS scans_30d,
      COALESCE(SUM(s.reward_xof) FILTER (WHERE s.created_at >= now() - interval '30 days'), 0) AS earnings_30d_xof
    FROM scans s
    JOIN collaborations c ON c.id = s.collaboration_id
    WHERE c.influencer_id = ${influencerId}::uuid
  `);
  const agg = aggRows[0]!;

  // Breakdown par collab (toutes, même non-active, pour transparence).
  const breakdown = await prisma.$queryRaw<
    {
      collab_id: string;
      restaurant_id: string;
      restaurant_name: string;
      restaurant_slug: string;
      code: string;
      discount_percent: number | null;
      reward_per_scan_xof: number | null;
      scans_count: bigint;
      earnings_xof: bigint | null;
    }[]
  >(Prisma.sql`
    SELECT
      c.id AS collab_id,
      r.id AS restaurant_id,
      r.name AS restaurant_name,
      r.slug AS restaurant_slug,
      c.code,
      c.discount_percent,
      c.reward_per_scan_xof,
      COUNT(s.id) AS scans_count,
      COALESCE(SUM(s.reward_xof), 0) AS earnings_xof
    FROM collaborations c
    JOIN restaurants r ON r.id = c.restaurant_id
    LEFT JOIN scans s ON s.collaboration_id = c.id
    WHERE c.influencer_id = ${influencerId}::uuid
    GROUP BY c.id, r.id, r.name, r.slug, c.code, c.discount_percent, c.reward_per_scan_xof
    ORDER BY earnings_xof DESC, c.requested_at DESC
  `);

  // 20 derniers scans toutes collabs confondues.
  const recent = await prisma.scan.findMany({
    where: { collaboration: { influencerId } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      createdAt: true,
      rewardXof: true,
      collaboration: {
        select: {
          code: true,
          restaurant: { select: { name: true } },
        },
      },
    },
  });

  const body: InfluencerStats = {
    displayName: inf.displayName,
    totals: {
      scansCount: Number(agg.scans_count),
      earningsXof: Number(agg.earnings_xof ?? 0),
      scansToday: Number(agg.scans_today),
      earningsTodayXof: Number(agg.earnings_today_xof ?? 0),
      scans7d: Number(agg.scans_7d),
      earnings7dXof: Number(agg.earnings_7d_xof ?? 0),
      scans30d: Number(agg.scans_30d),
      earnings30dXof: Number(agg.earnings_30d_xof ?? 0),
    },
    collaborations: breakdown.map((b) => ({
      collaborationId: b.collab_id,
      restaurantId: b.restaurant_id,
      restaurantName: b.restaurant_name,
      restaurantSlug: b.restaurant_slug,
      code: b.code,
      discountPercent: b.discount_percent,
      rewardPerScanXof: b.reward_per_scan_xof,
      scansCount: Number(b.scans_count),
      earningsXof: Number(b.earnings_xof ?? 0),
    })),
    recentScans: recent.map((s): RecentScan => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      rewardXof: s.rewardXof,
      restaurantName: s.collaboration.restaurant.name,
      influencerCode: s.collaboration.code,
    })),
  };
  res.json(body);
});

// GET /api/influencer-auth/discover — annuaire des restaurants actifs avec statut de collab existante
influencerCollaborationsRouter.get('/discover', async (req, res) => {
  const influencerId = req.influencerId!;

  const [restaurants, myCollabs] = await Promise.all([
    prisma.restaurant.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.collaboration.findMany({
      where: { influencerId },
      select: { restaurantId: true, status: true },
    }),
  ]);

  const byResto = new Map(myCollabs.map((c) => [c.restaurantId, c.status] as const));
  const items: RestaurantDirectoryItem[] = restaurants.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    existingCollaborationStatus: byResto.get(r.id) ?? null,
  }));
  res.json({ restaurants: items });
});
