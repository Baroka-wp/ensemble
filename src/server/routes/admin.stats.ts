import { Router } from 'express';
import { Prisma } from '@prisma/client';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { loadEnv } from '../../shared/env.js';
import { scansQuery, type AdminStats, type QrPayload, type ScanListItem, type ScansPage } from '../../shared/schemas/admin.js';

export const adminStatsRouter = Router();
adminStatsRouter.use(requireAuth);

const env = loadEnv();

adminStatsRouter.get('/stats', async (req, res) => {
  const restaurantId = req.restaurantId!;

  const aggRows = await prisma.$queryRaw<
    {
      scans_today: bigint;
      earnings_today_xof: bigint | null;
      scans_7d: bigint;
      earnings_7d_xof: bigint | null;
      scans_30d: bigint;
      earnings_30d_xof: bigint | null;
      scans_all: bigint;
      earnings_all_xof: bigint | null;
    }[]
  >(Prisma.sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= date_trunc('day', now()))            AS scans_today,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= date_trunc('day', now())), 0) AS earnings_today_xof,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')           AS scans_7d,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= now() - interval '7 days'), 0)  AS earnings_7d_xof,
      COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')          AS scans_30d,
      COALESCE(SUM(reward_xof) FILTER (WHERE created_at >= now() - interval '30 days'), 0) AS earnings_30d_xof,
      COUNT(*)                                                                  AS scans_all,
      COALESCE(SUM(reward_xof), 0)                                              AS earnings_all_xof
    FROM scans
    WHERE restaurant_id = ${restaurantId}::uuid
  `);
  const agg = aggRows[0]!;

  const top = await prisma.$queryRaw<
    {
      id: string;
      display_name: string;
      code: string;
      scans_count: bigint;
      earnings_xof: bigint | null;
    }[]
  >(Prisma.sql`
    SELECT i.id, i.display_name, i.code,
           COUNT(s.id)                     AS scans_count,
           COALESCE(SUM(s.reward_xof), 0)  AS earnings_xof
    FROM influencers i
    LEFT JOIN scans s ON s.influencer_id = i.id
    WHERE i.restaurant_id = ${restaurantId}::uuid
    GROUP BY i.id, i.display_name, i.code
    ORDER BY earnings_xof DESC, scans_count DESC
    LIMIT 5
  `);

  const body: AdminStats = {
    totals: {
      scansToday: Number(agg.scans_today),
      earningsTodayXof: Number(agg.earnings_today_xof ?? 0),
      scans7d: Number(agg.scans_7d),
      earnings7dXof: Number(agg.earnings_7d_xof ?? 0),
      scans30d: Number(agg.scans_30d),
      earnings30dXof: Number(agg.earnings_30d_xof ?? 0),
      scansAll: Number(agg.scans_all),
      earningsAllXof: Number(agg.earnings_all_xof ?? 0),
    },
    topInfluencers: top.map((t) => ({
      id: t.id,
      displayName: t.display_name,
      code: t.code,
      scansCount: Number(t.scans_count),
      earningsXof: Number(t.earnings_xof ?? 0),
    })),
  };
  res.json(body);
});

adminStatsRouter.get('/scans', async (req, res) => {
  const restaurantId = req.restaurantId!;
  const q = scansQuery.parse(req.query);

  const where = {
    restaurantId,
    ...(q.influencerId ? { influencerId: q.influencerId } : {}),
    ...(q.from || q.to
      ? {
          createdAt: {
            ...(q.from ? { gte: new Date(q.from) } : {}),
            ...(q.to ? { lte: new Date(q.to) } : {}),
          },
        }
      : {}),
  } satisfies Prisma.ScanWhereInput;

  const [total, rows] = await Promise.all([
    prisma.scan.count({ where }),
    prisma.scan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: {
        influencer: { select: { id: true, displayName: true, code: true } },
        ticket: { select: { ticketCode: true } },
      },
    }),
  ]);

  const scans: ScanListItem[] = rows.map((s) => ({
    id: s.id,
    createdAt: s.createdAt.toISOString(),
    rewardXof: s.rewardXof,
    discountPercent: s.discountPercent,
    influencer: s.influencer,
    ticketCode: s.ticket?.ticketCode ?? null,
  }));

  const body: ScansPage = {
    scans,
    page: q.page,
    limit: q.limit,
    total,
    hasMore: q.page * q.limit < total,
  };
  res.json(body);
});

adminStatsRouter.get('/qr', async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.restaurantId! },
    select: { slug: true },
  });
  if (!restaurant) throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');

  const url = `${env.APP_DOMAIN.replace(/\/$/, '')}/s/${restaurant.slug}`;
  const opts = { errorCorrectionLevel: 'M' as const, margin: 2, width: 1024 };
  const [pngBase64, svg] = await Promise.all([
    QRCode.toDataURL(url, opts),
    QRCode.toString(url, { ...opts, type: 'svg' }),
  ]);

  const body: QrPayload = { url, pngBase64, svg };
  res.json(body);
});
