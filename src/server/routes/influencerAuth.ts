import { Router } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireInfluencerAuth } from '../middleware/requireAuth.js';
import {
  influencerLoginInput,
  influencerRegisterInput,
  updateInfluencerProfileInput,
  type InfluencerAuthResponse,
  type InfluencerSession,
} from '../../shared/schemas/influencerAuth.js';

export const influencerAuthRouter = Router();

const BCRYPT_COST = 12;

async function loadSession(influencerId: string): Promise<InfluencerSession | null> {
  const inf = await prisma.influencer.findUnique({ where: { id: influencerId } });
  if (!inf) return null;
  return {
    id: inf.id,
    displayName: inf.displayName,
    email: inf.email,
    isActive: inf.isActive,
  };
}

function isUniqueEmailViolation(err: unknown): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (err.code !== 'P2002') return false;
  const target = (err.meta as { target?: string[] } | undefined)?.target;
  return Array.isArray(target) ? target.includes('email') : true;
}

influencerAuthRouter.post('/register', async (req, res) => {
  const { email, password, displayName } = influencerRegisterInput.parse(req.body);

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  try {
    const inf = await prisma.influencer.create({
      data: { email, passwordHash, displayName },
    });
    const token = signToken({ sub: inf.id, email: inf.email, type: 'influencer' });
    const body: InfluencerAuthResponse = {
      token,
      influencer: {
        id: inf.id,
        displayName: inf.displayName,
        email: inf.email,
        isActive: inf.isActive,
      },
    };
    res.status(201).json(body);
  } catch (err) {
    if (isUniqueEmailViolation(err)) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Un compte existe déjà avec cet email');
    }
    throw err;
  }
});

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
  const body: InfluencerAuthResponse = {
    token,
    influencer: {
      id: inf.id,
      displayName: inf.displayName,
      email: inf.email,
      isActive: inf.isActive,
    },
  };
  res.json(body);
});

influencerAuthRouter.get('/me', requireInfluencerAuth, async (req, res) => {
  const session = await loadSession(req.influencerId!);
  if (!session) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }
  res.json({ influencer: session });
});

influencerAuthRouter.patch('/me', requireInfluencerAuth, async (req, res) => {
  const input = updateInfluencerProfileInput.parse(req.body);

  const data: Prisma.InfluencerUpdateInput = {};
  if (input.displayName !== undefined) data.displayName = input.displayName;
  if (input.email !== undefined) data.email = input.email;
  if (input.password !== undefined) {
    data.passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  }

  try {
    await prisma.influencer.update({
      where: { id: req.influencerId! },
      data,
    });
  } catch (err) {
    if (isUniqueEmailViolation(err)) {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Cet email est déjà utilisé');
    }
    throw err;
  }

  const session = await loadSession(req.influencerId!);
  if (!session) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Erreur serveur');
  }
  res.json({ influencer: session });
});
