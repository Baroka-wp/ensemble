import { Router } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireInfluencerAuth } from '../middleware/requireAuth.js';
import {
  influencerLoginInput,
  updateInfluencerCodeInput,
  type InfluencerAuthResponse,
  type InfluencerSession,
} from '../../shared/schemas/influencerAuth.js';
import { assertCodeAvailable } from '../lib/promoCode.js';
import type { InfluencerStats, RecentScan } from '../../shared/schemas/stats.js';

export const influencerAuthRouter = Router();

async function loadSession(influencerId: string): Promise<InfluencerSession | null> {
  const inf = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: { restaurant: { select: { name: true } } },
  });
  if (!inf) return null;
  return {
    id: inf.id,
    displayName: inf.displayName,
    code: inf.code,
    email: inf.email,
    restaurantName: inf.restaurant.name,
    discountPercent: inf.discountPercent,
    rewardPerScanXof: inf.rewardPerScanXof,
    isActive: inf.isActive,
  };
}

influencerAuthRouter.post('/login', async (req, res) => {
  const { email, password } = influencerLoginInput.parse(req.body);

  const inf = await prisma.influencer.findUnique({ where: { email } });
  if (!inf) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Identifiants incorrects');
  }
  const ok = await bcrypt.compare(password, inf.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Identifiants incorrects');
  }
  if (!inf.isActive) {
    throw new HttpError(403, 'INFLUENCER_INACTIVE', 'Compte désactivé');
  }

  const token = signToken({ sub: inf.id, email: inf.email, type: 'influencer' });
  const session = await loadSession(inf.id);
  if (!session) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Erreur serveur');
  }
  const body: InfluencerAuthResponse = { token, influencer: session };
  res.json(body);
});

influencerAuthRouter.get('/me', requireInfluencerAuth, async (req, res) => {
  const session = await loadSession(req.influencerId!);
  if (!session) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }
  res.json({ influencer: session });
});

influencerAuthRouter.get('/stats', requireInfluencerAuth, async (req, res) => {
  const influencer = await prisma.influencer.findUnique({
    where: { id: req.influencerId! },
    select: {
      id: true,
      displayName: true,
      code: true,
      discountPercent: true,
      rewardPerScanXof: true,
    },
  });
  if (!influencer) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }

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
      COALESCE(SUM(reward_xof), 0)                                          AS earnings_xof,
      COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))        AS scans_today,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= date_trunc('day', now())), 0) AS earnings_today_xof,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')       AS scans_7d,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= now() - interval '7 days'), 0)  AS earnings_7d_xof,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')      AS scans_30d,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= now() - interval '30 days'), 0) AS earnings_30d_xof
    FROM scans
    WHERE influencer_id = ${influencer.id}::uuid
  `);
  const agg = aggRows[0]!;

  const recent = await prisma.scan.findMany({
    where: { influencerId: influencer.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, createdAt: true, rewardXof: true },
  });

  const recentScans: RecentScan[] = recent.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    rewardXof: s.rewardXof,
  }));

  const body: InfluencerStats = {
    displayName: influencer.displayName,
    code: influencer.code,
    discountPercent: influencer.discountPercent,
    rewardPerScan: { amount: influencer.rewardPerScanXof, currency: 'XOF' },
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
    recentScans,
  };
  res.json(body);
});

influencerAuthRouter.patch('/code', requireInfluencerAuth, async (req, res) => {
  const { code } = updateInfluencerCodeInput.parse(req.body);

  const inf = await prisma.influencer.findUnique({
    where: { id: req.influencerId! },
    select: { id: true, restaurantId: true, isActive: true, code: true },
  });
  if (!inf) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }
  if (!inf.isActive) {
    throw new HttpError(403, 'INFLUENCER_INACTIVE', 'Compte désactivé');
  }
  if (code === inf.code) {
    const session = await loadSession(inf.id);
    res.json({ influencer: session });
    return;
  }

  await assertCodeAvailable(inf.restaurantId, code, inf.id);
  await prisma.influencer.update({
    where: { id: inf.id },
    data: { code },
  });

  const session = await loadSession(inf.id);
  if (!session) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Erreur serveur');
  }
  res.json({ influencer: session });
});
