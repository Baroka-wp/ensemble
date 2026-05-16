import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';
import { scanRateLimit } from '../middleware/scanRateLimit.js';
import { hashFingerprint } from '../lib/fingerprint.js';
import { generateUniqueTicketCode, isUniqueViolation } from '../lib/ticketCode.js';
import { DEVICE_BLOCK_PERMANENT_UNTIL_ISO, TICKET_VALIDITY_MS } from '../../shared/scanPolicy.js';
import { scanInput, type ScanCreatedEvent, type TicketPublic } from '../../shared/schemas/scan.js';
import { getIo } from '../socket/index.js';

export const publicRouter = Router();

// GET /api/public/restaurants/:slug — infos page scan
publicRouter.get('/restaurants/:slug', async (req, res) => {
  const slug = req.params.slug ?? '';
  if (!/^[a-z0-9-]{3,32}$/.test(slug)) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }
  const r = await prisma.restaurant.findFirst({
    where: { slug, isActive: true },
    select: { name: true, slug: true },
  });
  if (!r) {
    throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
  }
  res.json({ name: r.name, slug: r.slug });
});

// POST /api/public/scan — flux atomique
publicRouter.post('/scan', scanRateLimit, async (req, res) => {
  const { slug, influencerCode, fingerprint } = scanInput.parse(req.body);
  const code = influencerCode.toUpperCase();
  const fingerprintHash = hashFingerprint(fingerprint);

  for (let attempt = 0; attempt < 3; attempt++) {
    const ticketCode = await generateUniqueTicketCode();
    try {
      const ticket = await prisma.$transaction(
        async (tx) => {
          const restaurants = await tx.$queryRaw<{ id: string; name: string }[]>(
            Prisma.sql`SELECT id, name FROM restaurants WHERE slug = ${slug} AND is_active = true FOR UPDATE`,
          );
          const restaurant = restaurants[0];
          if (!restaurant) {
            throw new HttpError(404, 'RESTAURANT_NOT_FOUND', 'Restaurant introuvable');
          }

          const influencers = await tx.$queryRaw<
            {
              id: string;
              display_name: string;
              code: string;
              reward_per_scan_xof: number;
              discount_percent: number;
            }[]
          >(
            Prisma.sql`SELECT id, display_name, code, reward_per_scan_xof, discount_percent
                       FROM influencers
                       WHERE restaurant_id = ${restaurant.id}::uuid
                         AND upper(code) = ${code}
                         AND is_active = true
                       FOR UPDATE`,
          );
          const influencer = influencers[0];
          if (!influencer) {
            throw new HttpError(404, 'INVALID_CODE', 'Code influenceur invalide');
          }

          const blocks = await tx.$queryRaw<{ id: string }[]>(
            Prisma.sql`SELECT id FROM device_blocks
                       WHERE restaurant_id = ${restaurant.id}::uuid
                         AND fingerprint_hash = ${fingerprintHash}
                       LIMIT 1`,
          );
          if (blocks.length > 0) {
            throw new HttpError(
              409,
              'DEVICE_BLOCKED',
              'Vous avez déjà utilisé votre réduction dans ce restaurant.',
            );
          }

          const scan = await tx.scan.create({
            data: {
              restaurantId: restaurant.id,
              influencerId: influencer.id,
              fingerprintHash,
              rewardXof: influencer.reward_per_scan_xof,
              discountPercent: influencer.discount_percent,
            },
          });

          const expiresAt = new Date(Date.now() + TICKET_VALIDITY_MS);
          const blockedUntil = new Date(DEVICE_BLOCK_PERMANENT_UNTIL_ISO);
          const created = await tx.ticket.create({
            data: { scanId: scan.id, ticketCode, expiresAt },
          });

          await tx.deviceBlock.upsert({
            where: {
              uniq_device_block: {
                restaurantId: restaurant.id,
                fingerprintHash,
              },
            },
            create: {
              restaurantId: restaurant.id,
              fingerprintHash,
              blockedUntil,
            },
            update: { blockedUntil },
          });

          return {
            ticket: {
              code: created.ticketCode,
              discountPercent: influencer.discount_percent,
              restaurantName: restaurant.name,
              expiresAt: created.expiresAt.toISOString(),
              createdAt: created.createdAt.toISOString(),
            } satisfies TicketPublic,
            event: {
              scanId: scan.id,
              influencerId: influencer.id,
              influencerName: influencer.display_name,
              influencerCode: influencer.code,
              discountPercent: influencer.discount_percent,
              rewardXof: influencer.reward_per_scan_xof,
              ticketCode: created.ticketCode,
              createdAt: scan.createdAt.toISOString(),
            } satisfies ScanCreatedEvent,
            restaurantId: restaurant.id,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
      );

      try {
        const io = getIo();
        io.of('/admin').to(`restaurant:${ticket.restaurantId}`).emit('scan:created', ticket.event);
        io.of('/influencer').to(`influencer:${ticket.event.influencerId}`).emit('scan:created', ticket.event);
      } catch {
        // best-effort
      }

      res.status(201).json({ ticket: ticket.ticket });
      return;
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }
  throw new HttpError(500, 'TICKET_COLLISION', 'Impossible de générer un ticket');
});
