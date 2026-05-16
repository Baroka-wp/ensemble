import crypto from 'node:crypto';

/**
 * Hash SHA-256 du visitorId FingerprintJS.
 * On ne stocke jamais le visitorId brut côté serveur (§4.3).
 */
export function hashFingerprint(visitorId: string): string {
  return crypto.createHash('sha256').update(visitorId, 'utf8').digest('hex');
}
