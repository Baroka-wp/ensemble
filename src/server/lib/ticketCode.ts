import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';

// Alphabet sans 0/O/1/I (§3.3 — lisibilité caisse).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function block(len: number): string {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

export function generateTicketCode(): string {
  return `TKT-${block(4)}-${block(4)}`;
}

/**
 * Génère un code unique global (retry sur collision via @@unique sur tickets.ticket_code).
 * Utilisé HORS transaction : si on n’a pas trouvé en 5 essais on relance la transaction côté caller.
 */
export async function generateUniqueTicketCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateTicketCode();
    const exists = await prisma.ticket.findUnique({
      where: { ticketCode: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  throw new Error('Impossible de générer un code ticket unique');
}

export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}
