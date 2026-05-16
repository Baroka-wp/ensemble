import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  let dbStatus: 'ok' | 'down' = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'down';
  }
  res.status(dbStatus === 'ok' ? 200 : 503).json({ status: dbStatus === 'ok' ? 'ok' : 'degraded', db: dbStatus });
});
