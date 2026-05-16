import { Router } from 'express';
import bcrypt from 'bcrypt';
import type { Restaurant } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { generateUniqueSlug } from '../lib/slug.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { loginInput, registerInput, type AuthResponse, type RestaurantPublic } from '../../shared/schemas/auth.js';

export const authRouter = Router();

const BCRYPT_COST = 12;

function toPublic(r: Restaurant): RestaurantPublic {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    email: r.email,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
  };
}

authRouter.post('/register', async (req, res) => {
  const { email, password, restaurantName } = registerInput.parse(req.body);

  const existing = await prisma.restaurant.findUnique({ where: { email } });
  if (existing) {
    throw new HttpError(409, 'EMAIL_TAKEN', 'Un compte existe déjà avec cet email');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const slug = await generateUniqueSlug(restaurantName);

  let restaurant: Restaurant;
  try {
    restaurant = await prisma.restaurant.create({
      data: { name: restaurantName, slug, email, passwordHash },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new HttpError(409, 'EMAIL_TAKEN', 'Un compte existe déjà avec cet email');
    }
    throw err;
  }

  const token = signToken({ sub: restaurant.id, email: restaurant.email, type: 'restaurant' });
  const body: AuthResponse = { token, restaurant: toPublic(restaurant) };
  res.status(201).json(body);
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = loginInput.parse(req.body);

  const restaurant = await prisma.restaurant.findUnique({ where: { email } });
  if (!restaurant) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Identifiants incorrects');
  }
  const ok = await bcrypt.compare(password, restaurant.passwordHash);
  if (!ok) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Identifiants incorrects');
  }
  if (!restaurant.isActive) {
    throw new HttpError(403, 'RESTAURANT_INACTIVE', 'Compte désactivé');
  }

  const token = signToken({ sub: restaurant.id, email: restaurant.email, type: 'restaurant' });
  const body: AuthResponse = { token, restaurant: toPublic(restaurant) };
  res.json(body);
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.restaurantId! } });
  if (!restaurant) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Compte introuvable');
  }
  res.json({ restaurant: toPublic(restaurant) });
});
