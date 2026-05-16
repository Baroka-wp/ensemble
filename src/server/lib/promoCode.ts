import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { normalizePromoCode, PROMO_ALPHABET } from '../../shared/promoCode.js';
import { promoCodeInput } from '../../shared/schemas/influencer.js';
import { HttpError } from '../middleware/errorHandler.js';

const CODE_LEN = 7;

export function generatePromoCode(length = CODE_LEN): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += PROMO_ALPHABET[bytes[i]! % PROMO_ALPHABET.length];
  }
  return out;
}

export { normalizePromoCode };

export async function assertCodeAvailable(
  restaurantId: string,
  code: string,
  excludeInfluencerId?: string,
): Promise<void> {
  const existing = await prisma.influencer.findUnique({
    where: { uniq_influencer_code_per_restaurant: { restaurantId, code } },
    select: { id: true },
  });
  if (existing && existing.id !== excludeInfluencerId) {
    throw new HttpError(409, 'CODE_TAKEN', 'Ce code promo est déjà utilisé');
  }
}

/** Code personnalisé validé, ou génération aléatoire si absent. */
export async function resolvePromoCode(
  restaurantId: string,
  requested?: string,
  excludeInfluencerId?: string,
): Promise<string> {
  if (requested !== undefined && requested !== '') {
    const code = promoCodeInput.parse(requested);
    await assertCodeAvailable(restaurantId, code, excludeInfluencerId);
    return code;
  }
  return generateUniqueCode(restaurantId);
}

/**
 * Génère un code unique pour ce restaurant (retry si collision).
 */
export async function generateUniqueCode(restaurantId: string, maxAttempts = 8): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generatePromoCode();
    const exists = await prisma.influencer.findUnique({
      where: { uniq_influencer_code_per_restaurant: { restaurantId, code: candidate } },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  throw new Error('Impossible de générer un code unique');
}

export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}
