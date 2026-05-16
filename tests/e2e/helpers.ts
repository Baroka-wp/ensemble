import { PrismaClient } from '@prisma/client';
import type { Page } from '@playwright/test';

const prisma = new PrismaClient();

export const SEED_RESTAURANT_SLUG = 'chez-martin';
export const SEED_INFLUENCER_CODE = 'MARIE7K';
export const SEED_LOGIN = { email: 'demo@resto.fr', password: 'demo1234' };

/** Purge tout l'état "client" pour le restaurant seed (scans + tickets + device_blocks). */
export async function resetSeedRestaurantState() {
  const r = await prisma.restaurant.findUnique({ where: { slug: SEED_RESTAURANT_SLUG } });
  if (!r) return;
  // Cascade : scans → tickets ; device_blocks indépendant
  await prisma.scan.deleteMany({ where: { restaurantId: r.id } });
  await prisma.deviceBlock.deleteMany({ where: { restaurantId: r.id } });
}

/** Purge un compte de test (idempotent). */
export async function deleteRestaurantByEmail(email: string) {
  await prisma.restaurant.deleteMany({ where: { email } });
}

export async function deleteInfluencerByEmail(email: string) {
  await prisma.influencer.deleteMany({ where: { email } });
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

/** Injecte un fingerprint déterministe avant tout JS de la page. */
export async function setTestFingerprint(page: Page, fingerprint: string) {
  await page.addInitScript((fp) => {
    (window as unknown as { __TEST_FINGERPRINT: string }).__TEST_FINGERPRINT = fp;
  }, fingerprint);
}
