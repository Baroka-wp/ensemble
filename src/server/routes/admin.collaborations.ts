import { Router } from 'express';
import bcrypt from 'bcrypt';
import type { Collaboration, Influencer } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { generateUniqueCode, isUniqueViolation, resolvePromoCode } from '../lib/promoCode.js';
import {
  acceptCollaborationInput,
  updateCollaborationParamsInput,
  type CollaborationForRestaurant,
  type CollaborationStatus,
} from '../../shared/schemas/collaboration.js';
import {
  createInfluencerInput,
  updateInfluencerInput,
} from '../../shared/schemas/influencer.js';

export const adminCollaborationsRouter = Router();
adminCollaborationsRouter.use(requireAuth);

const BCRYPT_COST = 12;

type CollabWithInf = Collaboration & {
  influencer: Pick<Influencer, 'id' | 'displayName' | 'email'>;
};

function toForRestaurant(c: CollabWithInf): CollaborationForRestaurant {
  return {
    id: c.id,
    status: c.status,
    code: c.code,
    discountPercent: c.discountPercent,
    rewardPerScanXof: c.rewardPerScanXof,
    requestedAt: c.requestedAt.toISOString(),
    decidedAt: c.decidedAt?.toISOString() ?? null,
    influencer: c.influencer,
  };
}

async function ensureOwned(collaborationId: string, restaurantId: string): Promise<CollabWithInf> {
  const c = await prisma.collaboration.findFirst({
    where: { id: collaborationId, restaurantId },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  if (!c) throw new HttpError(404, 'COLLABORATION_NOT_FOUND', 'Collaboration introuvable');
  return c;
}

// GET /api/admin/collaborations?status=pending|active|...
adminCollaborationsRouter.get('/', async (req, res) => {
  const rawStatus = req.query.status;
  const status =
    typeof rawStatus === 'string' &&
    ['pending', 'active', 'rejected', 'paused_by_inf', 'paused_by_resto'].includes(rawStatus)
      ? (rawStatus as CollaborationStatus)
      : undefined;

  const list = await prisma.collaboration.findMany({
    where: {
      restaurantId: req.restaurantId!,
      ...(status ? { status } : {}),
    },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
    orderBy: [{ status: 'asc' }, { requestedAt: 'desc' }],
  });
  res.json({ collaborations: list.map(toForRestaurant) });
});

// GET /api/admin/collaborations/counts — pour le badge "Demandes en attente"
adminCollaborationsRouter.get('/counts', async (req, res) => {
  const restaurantId = req.restaurantId!;
  const grouped = await prisma.collaboration.groupBy({
    by: ['status'],
    where: { restaurantId },
    _count: { _all: true },
  });
  const counts: Record<CollaborationStatus, number> = {
    pending: 0,
    active: 0,
    rejected: 0,
    paused_by_inf: 0,
    paused_by_resto: 0,
  };
  for (const g of grouped) {
    counts[g.status as CollaborationStatus] = g._count._all;
  }
  res.json({ counts });
});

// GET /api/admin/collaborations/:id
adminCollaborationsRouter.get('/:id', async (req, res) => {
  const c = await ensureOwned(req.params.id!, req.restaurantId!);
  res.json({ collaboration: toForRestaurant(c) });
});

// POST /api/admin/collaborations/:id/accept — fixe discount + reward et passe en active
adminCollaborationsRouter.post('/:id/accept', async (req, res) => {
  const { discountPercent, rewardPerScanXof } = acceptCollaborationInput.parse(req.body);
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);

  if (collab.status !== 'pending') {
    throw new HttpError(409, 'INVALID_STATE', `Une demande ${collab.status} ne peut pas être acceptée`);
  }

  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: {
      status: 'active',
      discountPercent,
      rewardPerScanXof,
      decidedAt: new Date(),
    },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  res.json({ collaboration: toForRestaurant(updated) });
});

// POST /api/admin/collaborations/:id/reject
adminCollaborationsRouter.post('/:id/reject', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);
  if (collab.status !== 'pending') {
    throw new HttpError(409, 'INVALID_STATE', `Une demande ${collab.status} ne peut pas être refusée`);
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: 'rejected', decidedAt: new Date() },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  res.json({ collaboration: toForRestaurant(updated) });
});

// POST /api/admin/collaborations/:id/pause — met en pause du côté restaurant
adminCollaborationsRouter.post('/:id/pause', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);
  if (collab.status !== 'active') {
    throw new HttpError(403, 'COLLABORATION_NOT_ACTIVE', 'Seule une collaboration active peut être mise en pause');
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: 'paused_by_resto' },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  res.json({ collaboration: toForRestaurant(updated) });
});

// POST /api/admin/collaborations/:id/resume — réactive (seulement si paused_by_resto)
adminCollaborationsRouter.post('/:id/resume', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);
  if (collab.status !== 'paused_by_resto') {
    throw new HttpError(
      403,
      'CANNOT_RESUME',
      collab.status === 'paused_by_inf'
        ? 'L’influenceur a mis cette collaboration en pause'
        : 'Cette collaboration ne peut pas être réactivée',
    );
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: { status: 'active' },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  res.json({ collaboration: toForRestaurant(updated) });
});

// PATCH /api/admin/collaborations/:id — modifier discount/reward d'une collab active
adminCollaborationsRouter.patch('/:id', async (req, res) => {
  const input = updateCollaborationParamsInput.parse(req.body);
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);
  if (collab.status !== 'active' && collab.status !== 'paused_by_inf' && collab.status !== 'paused_by_resto') {
    throw new HttpError(409, 'INVALID_STATE', `Les paramètres d'une collab ${collab.status} ne sont pas modifiables`);
  }
  const updated = await prisma.collaboration.update({
    where: { id: collab.id },
    data: {
      discountPercent: input.discountPercent,
      rewardPerScanXof: input.rewardPerScanXof,
    },
    include: { influencer: { select: { id: true, displayName: true, email: true } } },
  });
  res.json({ collaboration: toForRestaurant(updated) });
});

/**
 * POST /api/admin/collaborations/quick-create
 * Workflow "old style" : le restaurant crée un compte influenceur ET une collab active en un seul appel.
 * Reçoit : displayName, email, password, discountPercent, rewardPerScanXof, [code].
 */
adminCollaborationsRouter.post('/quick-create', async (req, res) => {
  const input = createInfluencerInput.parse(req.body);
  const restaurantId = req.restaurantId!;
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const code = await resolvePromoCode(restaurantId, input.code);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Si l'email existe déjà, on réutilise l'influenceur, sinon on le crée.
      let influencer = await tx.influencer.findUnique({ where: { email: input.email } });
      if (!influencer) {
        influencer = await tx.influencer.create({
          data: {
            email: input.email,
            passwordHash,
            displayName: input.displayName,
          },
        });
      }

      // Vérifie pas de collab déjà existante avec ce resto.
      const existing = await tx.collaboration.findUnique({
        where: { uniq_collaboration_pair: { influencerId: influencer.id, restaurantId } },
        select: { id: true, status: true },
      });
      if (existing) {
        throw new HttpError(
          409,
          'COLLABORATION_EXISTS',
          `Une collaboration ${existing.status} existe déjà avec cet influenceur`,
        );
      }

      const collab = await tx.collaboration.create({
        data: {
          influencerId: influencer.id,
          restaurantId,
          code,
          discountPercent: input.discountPercent,
          rewardPerScanXof: input.rewardPerScanXof,
          status: 'active',
          decidedAt: new Date(),
        },
        include: { influencer: { select: { id: true, displayName: true, email: true } } },
      });

      return collab;
    });

    res.status(201).json({ collaboration: toForRestaurant(result) });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (isUniqueViolation(err)) {
      const meta = (err as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes('code')) {
        throw new HttpError(409, 'CODE_TAKEN', 'Ce code promo est déjà utilisé');
      }
      if (meta?.target?.includes('email')) {
        throw new HttpError(409, 'EMAIL_TAKEN', 'Erreur sur l’email');
      }
      throw new HttpError(409, 'CONFLICT', 'Conflit de données');
    }
    throw err;
  }
});

/**
 * POST /api/admin/collaborations/:id/regenerate-code
 * Régénère un code aléatoire pour cette collab (utile si l'influenceur abuse).
 */
adminCollaborationsRouter.post('/:id/regenerate-code', async (req, res) => {
  const collab = await ensureOwned(req.params.id!, req.restaurantId!);

  for (let attempt = 0; attempt < 3; attempt++) {
    const newCode = await generateUniqueCode(collab.restaurantId);
    try {
      const updated = await prisma.collaboration.update({
        where: { id: collab.id },
        data: { code: newCode },
        include: { influencer: { select: { id: true, displayName: true, email: true } } },
      });
      res.json({ collaboration: toForRestaurant(updated) });
      return;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw new HttpError(500, 'CODE_COLLISION', 'Impossible de générer un code unique');
});
