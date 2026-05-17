/**
 * Mémoire locale des tickets émis sur ce device.
 * Permet d'afficher le bouton « Donner mon avis » quand le client revient sur la page scan.
 *
 * Stocké en localStorage (et non en cookie HTTP) parce que :
 *  - aucun côté serveur n'a besoin de cette info
 *  - le délai de validité (7 jours) est largement supporté
 *  - pas de problème CORS / SameSite
 */
import { REVIEW_COOKIE_TTL_MS } from '../../shared/schemas/review';

const STORAGE_KEY = 'ir.visited-tickets';

export interface VisitedTicket {
  ticketCode: string;
  restaurantSlug: string;
  createdAt: number; // epoch ms du scan
}

interface Store {
  version: 1;
  tickets: VisitedTicket[];
}

function read(): VisitedTicket[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Store;
    if (parsed.version !== 1 || !Array.isArray(parsed.tickets)) return [];
    // Purge les tickets expirés (> TTL)
    const now = Date.now();
    return parsed.tickets.filter((t) => now - t.createdAt < REVIEW_COOKIE_TTL_MS);
  } catch {
    return [];
  }
}

function write(tickets: VisitedTicket[]) {
  if (typeof window === 'undefined') return;
  try {
    const store: Store = { version: 1, tickets };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore quota / private mode
  }
}

/** Enregistre un ticket émis. Si un ticket existait déjà pour ce slug, il est remplacé (le plus récent). */
export function rememberTicket(t: VisitedTicket) {
  const existing = read().filter((x) => x.restaurantSlug !== t.restaurantSlug);
  write([t, ...existing]);
}

/** Renvoie le ticket le plus récent pour un slug donné, ou null. */
export function getTicketForSlug(slug: string): VisitedTicket | null {
  return read().find((t) => t.restaurantSlug === slug) ?? null;
}

/** Marque un slug comme « avis donné » → on retire son ticket du store. */
export function forgetTicketForSlug(slug: string) {
  const remaining = read().filter((t) => t.restaurantSlug !== slug);
  write(remaining);
}
