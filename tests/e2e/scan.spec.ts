import { test, expect } from '@playwright/test';
import {
  SEED_RESTAURANT_SLUG,
  SEED_INFLUENCER_CODE,
  resetSeedRestaurantState,
  setTestFingerprint,
  disconnectPrisma,
} from './helpers';

test.describe('Flux scan public (critère §13)', () => {
  test.beforeEach(async () => {
    await resetSeedRestaurantState();
  });

  test.afterAll(async () => {
    await disconnectPrisma();
  });

  test('QR → page scan → code valide → ticket avec bon %', async ({ page }) => {
    await setTestFingerprint(page, 'e2e-fp-happy-path');
    await page.goto(`/s/${SEED_RESTAURANT_SLUG}`);

    // Le nom du restaurant s'affiche
    await expect(page.getByRole('heading', { name: 'Chez Martin' })).toBeVisible();

    // Saisie du code (la page upper-case automatiquement)
    await page.getByLabel('Code influenceur').fill(SEED_INFLUENCER_CODE.toLowerCase());
    await page.getByRole('button', { name: /Obtenir ma réduction/i }).click();

    // Ticket affiché avec le bon % (15 % seed) et le format TKT-XXXX-XXXX
    await expect(page.getByText('−15 %')).toBeVisible();
    await expect(page.getByText(/^TKT-[A-Z0-9]{4}-[A-Z0-9]{4}$/)).toBeVisible();
    await expect(page.getByText('Montrez cet écran en caisse')).toBeVisible();
  });

  test('2e scan même device → blocage permanent, pas de 2e ticket', async ({ page }) => {
    const FP = 'e2e-fp-block-device';
    await setTestFingerprint(page, FP);

    // 1er scan — succès
    await page.goto(`/s/${SEED_RESTAURANT_SLUG}`);
    await page.getByLabel('Code influenceur').fill(SEED_INFLUENCER_CODE);
    await page.getByRole('button', { name: /Obtenir ma réduction/i }).click();
    await expect(page.getByText(/^TKT-/)).toBeVisible();

    // 2e scan même device → blocage
    await page.goto(`/s/${SEED_RESTAURANT_SLUG}`);
    await page.getByLabel('Code influenceur').fill(SEED_INFLUENCER_CODE);
    await page.getByRole('button', { name: /Obtenir ma réduction/i }).click();

    await expect(page.getByText(/Vous avez déjà utilisé votre réduction/i)).toBeVisible();
    // Pas de ticket affiché (toujours sur la page scan)
    await expect(page.getByText(/^TKT-/)).toHaveCount(0);
  });

  test('Code invalide → message d’erreur clair', async ({ page }) => {
    await setTestFingerprint(page, 'e2e-fp-bad-code');
    await page.goto(`/s/${SEED_RESTAURANT_SLUG}`);
    await page.getByLabel('Code influenceur').fill('INVALID9');
    await page.getByRole('button', { name: /Obtenir ma réduction/i }).click();

    await expect(page.getByText(/Ce code influenceur est invalide/i)).toBeVisible();
  });

  test('Slug inconnu → page « lien invalide »', async ({ page }) => {
    await page.goto('/s/aucun-resto-ici');
    await expect(page.getByRole('heading', { name: /Ce restaurant/i })).toBeVisible();
  });
});
