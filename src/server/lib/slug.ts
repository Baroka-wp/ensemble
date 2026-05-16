import { prisma } from './prisma.js';

const SLUG_RE = /^[a-z0-9-]{3,32}$/;

export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  if (base.length < 3) {
    return (base + '-resto').slice(0, 32);
  }
  return base;
}

/**
 * Réserve un slug unique : essaie la base, puis -2, -3… jusqu'à -50.
 * Si tout est pris, ajoute un suffixe aléatoire 4 chars.
 */
export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  if (!SLUG_RE.test(base)) {
    throw new Error('Slug généré invalide');
  }

  if (!(await prisma.restaurant.findUnique({ where: { slug: base } }))) {
    return base;
  }
  for (let i = 2; i <= 50; i++) {
    const candidate = `${base}-${i}`.slice(0, 32);
    if (!(await prisma.restaurant.findUnique({ where: { slug: candidate } }))) {
      return candidate;
    }
  }
  const random = Math.random().toString(36).slice(2, 6);
  return `${base.slice(0, 27)}-${random}`;
}
