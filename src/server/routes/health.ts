import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

// Liveness : le processus HTTP peut servir la vitrine même si la base est temporairement indisponible.
healthRouter.get('/live', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

healthRouter.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'down' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'down';
  }
  res.status(dbStatus === 'ok' ? 200 : 503).json({ status: dbStatus === 'ok' ? 'ok' : 'degraded', db: dbStatus });
});
