import { Router } from 'express';
import bcrypt from 'bcrypt';
import type { Influencer } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { generateUniqueCode, isUniqueViolation, resolvePromoCode } from '../lib/promoCode.js';
import {
  createInfluencerInput,
  updateInfluencerInput,
  type InfluencerPublic,
} from '../../shared/schemas/influencer.js';

export const adminInfluencersRouter = Router();
adminInfluencersRouter.use(requireAuth);

const BCRYPT_COST = 12;

function toPublic(i: Influencer): InfluencerPublic {
  return {
    id: i.id,
    displayName: i.displayName,
    code: i.code,
    email: i.email,
    discountPercent: i.discountPercent,
    rewardPerScanXof: i.rewardPerScanXof,
    isActive: i.isActive,
    createdAt: i.createdAt.toISOString(),
  };
}

adminInfluencersRouter.get('/', async (req, res) => {
  const list = await prisma.influencer.findMany({
    where: { restaurantId: req.restaurantId! },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ influencers: list.map(toPublic) });
});

adminInfluencersRouter.post('/', async (req, res) => {
  const input = createInfluencerInput.parse(req.body);
  const restaurantId = req.restaurantId!;
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

  // Vérifie l’email avant la boucle pour erreur claire
  const existingEmail = await prisma.influencer.findUnique({ where: { email: input.email } });
  if (existingEmail) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'Un influenceur utilise déjà cet email');
  }

  const code = await resolvePromoCode(restaurantId, input.code);

  try {
    const created = await prisma.influencer.create({
      data: {
        restaurantId,
        displayName: input.displayName,
        code,
          email: input.email,
          passwordHash,
          discountPercent: input.discountPercent,
          rewardPerScanXof: input.rewardPerScanXof,
        },
      });
    res.status(201).json({ influencer: toPublic(created) });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (isUniqueViolation(err)) {
      const meta = (err as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes('email')) {
        throw new HttpError(409, 'EMAIL_TAKEN', 'Un influenceur utilise déjà cet email');
      }
      throw new HttpError(409, 'CODE_TAKEN', 'Ce code promo est déjà utilisé');
    }
    throw err;
  }
});

async function ensureOwned(id: string, restaurantId: string): Promise<Influencer> {
  const inf = await prisma.influencer.findFirst({ where: { id, restaurantId } });
  if (!inf) throw new HttpError(404, 'INFLUENCER_NOT_FOUND', 'Influenceur introuvable');
  return inf;
}

adminInfluencersRouter.get('/:id', async (req, res) => {
  const inf = await ensureOwned(req.params.id!, req.restaurantId!);
  res.json({ influencer: toPublic(inf) });
});

adminInfluencersRouter.patch('/:id', async (req, res) => {
  const input = updateInfluencerInput.parse(req.body);
  await ensureOwned(req.params.id!, req.restaurantId!);

  const restaurantId = req.restaurantId!;
  const influencerId = req.params.id!;

  const data: Record<string, unknown> = {
    displayName: input.displayName,
    email: input.email,
    discountPercent: input.discountPercent,
    isActive: input.isActive,
    rewardPerScanXof: input.rewardPerScanXof,
  };
  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  }
  if (input.code !== undefined) {
    data.code = await resolvePromoCode(restaurantId, input.code, influencerId);
  }

  try {
    const updated = await prisma.influencer.update({
      where: { id: influencerId },
      data,
    });
    res.json({ influencer: toPublic(updated) });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (isUniqueViolation(err)) {
      const meta = (err as { meta?: { target?: string[] } }).meta;
      if (meta?.target?.includes('code')) {
        throw new HttpError(409, 'CODE_TAKEN', 'Ce code promo est déjà utilisé');
      }
      throw new HttpError(409, 'EMAIL_TAKEN', 'Un influenceur utilise déjà cet email');
    }
    throw err;
  }
});

adminInfluencersRouter.post('/:id/revoke-code', async (req, res) => {
  const restaurantId = req.restaurantId!;
  await ensureOwned(req.params.id!, restaurantId);

  for (let attempt = 0; attempt < 3; attempt++) {
    const newCode = await generateUniqueCode(restaurantId);
    try {
      const updated = await prisma.influencer.update({
        where: { id: req.params.id! },
        data: { code: newCode, isActive: true },
      });
      res.json({ influencer: toPublic(updated) });
      return;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw new HttpError(500, 'CODE_COLLISION', 'Impossible de générer un code unique');
});
