/** Alphabet lisible (sans 0/O, 1/I) — aligné serveur. */
export const PROMO_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const PROMO_CODE_MIN = 4;
export const PROMO_CODE_MAX = 12;

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function generatePromoCode(length = 7): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += PROMO_ALPHABET[Math.floor(Math.random() * PROMO_ALPHABET.length)]!;
  }
  return out;
}
