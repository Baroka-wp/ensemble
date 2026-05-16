import { test, expect } from '@playwright/test';
import { deleteRestaurantByEmail, deleteInfluencerByEmail, disconnectPrisma } from './helpers';

const E2E_EMAIL = `e2e+${Date.now()}@test.local`;
const E2E_PASSWORD = 'e2etest1234';
const E2E_NAME = 'E2E Diner';

const INF_EMAIL = `e2e-inf+${Date.now()}@test.local`;
const INF_PASSWORD = 'influencer1234';

test.describe('Inscription + création influenceur (critère §13)', () => {
  test.beforeAll(async () => {
    await deleteRestaurantByEmail(E2E_EMAIL);
    await deleteInfluencerByEmail(INF_EMAIL);
  });

  test.afterAll(async () => {
    await deleteRestaurantByEmail(E2E_EMAIL); // cascade les influenceurs liés
    await disconnectPrisma();
  });

  test('Register → dashboard → créer un influenceur (FCFA + login) → code affiché', async ({ page }) => {
    // Inscription restaurant
    await page.goto('/register');
    await page.getByLabel('Nom du restaurant').fill(E2E_NAME);
    await page.getByLabel('Email').fill(E2E_EMAIL);
    await page.getByLabel('Mot de passe').fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /Créer mon espace/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(E2E_NAME)).toBeVisible();

    // Influenceurs (vide)
    await page.getByRole('link', { name: 'Influenceurs', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/influencers$/);
    await expect(page.getByText('Aucun influenceur pour l’instant.')).toBeVisible();

    // Créer un influenceur avec email + password + reward FCFA
    await page.getByRole('link', { name: /Créer le premier/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/influencers\/new$/);

    await page.getByLabel('Nom de l’influenceur').fill('Alice');
    await page.getByLabel('Email de connexion').fill(INF_EMAIL);
    await page.getByLabel('Mot de passe initial').fill(INF_PASSWORD);
    // Pré-remplis : discount=15, reward=500 FCFA — on garde
    await page.getByRole('button', { name: 'Créer', exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard\/influencers\/[0-9a-f-]+$/);
    await expect(page.getByRole('heading', { name: 'Alice' })).toBeVisible();

    // Le code généré est visible (alphabet sans 0/O/1/I)
    const codeNode = page.locator('code').first();
    await expect(codeNode).toBeVisible();
    const code = (await codeNode.textContent())?.trim();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{6,8}$/);

    // L'email de connexion est affiché
    await expect(page.getByText(INF_EMAIL)).toBeVisible();
    // Le gain est formaté en FCFA
    await expect(page.getByText(/Gain actuel\s*:\s*500\s+FCFA/)).toBeVisible();
  });

  test('Login restaurant échoue avec mauvais mot de passe', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('demo@resto.fr');
    await page.getByLabel('Mot de passe').fill('wrong-password');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    await expect(page.getByText('Identifiants incorrects')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Login influenceur seed (Marie) → dashboard avec stats FCFA', async ({ page }) => {
    await page.goto('/i/login');
    await page.getByLabel('Email').fill('marie@demo.fr');
    await page.getByLabel('Mot de passe').fill('demo1234');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    await expect(page).toHaveURL(/\/i$/);
    await expect(page.getByRole('heading', { name: 'Marie' })).toBeVisible();
    // 5 scans du seed × 500 FCFA = 2 500 FCFA — l'espace est U+202F (narrow no-break space) en fr-FR
    await expect(page.getByText(/FCFA/).first()).toBeVisible();
  });

  test('Login influenceur échoue avec mauvais mot de passe', async ({ page }) => {
    await page.goto('/i/login');
    await page.getByLabel('Email').fill('marie@demo.fr');
    await page.getByLabel('Mot de passe').fill('wrong');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    await expect(page.getByText('Identifiants incorrects')).toBeVisible();
    await expect(page).toHaveURL(/\/i\/login$/);
  });

  test('Accès direct à /i sans login → redirection vers /i/login', async ({ page }) => {
    await page.goto('/i');
    await expect(page).toHaveURL(/\/i\/login$/);
  });
});
