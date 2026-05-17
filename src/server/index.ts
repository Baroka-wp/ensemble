import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { loadEnv } from '../shared/env.js';
import { logger } from './lib/logger.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { influencerAuthRouter } from './routes/influencerAuth.js';
import { influencerCollaborationsRouter } from './routes/influencer.collaborations.js';
import { adminCollaborationsRouter } from './routes/admin.collaborations.js';
import { adminStatsRouter } from './routes/admin.stats.js';
import { adminReviewsRouter } from './routes/admin.reviews.js';
import { publicRouter } from './routes/public.js';
import { publicReviewsRouter } from './routes/public.reviews.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createSocketServer } from './socket/index.js';

const env = loadEnv();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client');
const clientIndexPath = path.join(clientDist, 'index.html');
const serveClient = fs.existsSync(clientIndexPath);

const app = express();

// 1. Sécurité & parsing
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }),
);
app.use(cors({ origin: env.APP_DOMAIN, credentials: true }));
app.use(express.json({ limit: '64kb' }));

// 2. API
const api = express.Router();
api.use(healthRouter);
api.use('/auth', authRouter);
api.use('/influencer-auth', influencerAuthRouter);
api.use('/influencer-auth', influencerCollaborationsRouter);
api.use('/admin/collaborations', adminCollaborationsRouter);
api.use('/admin/reviews', adminReviewsRouter);
api.use('/admin', adminStatsRouter);
api.use('/public', publicRouter);
api.use('/public', publicReviewsRouter);
app.use('/api', api);

// 3. Static SPA (build Vite) — dès que dist/client est présent (image Docker / prod)
if (serveClient) {
  if (env.NODE_ENV !== 'production') {
    logger.warn(
      { NODE_ENV: env.NODE_ENV },
      'Build client détecté : le SPA est servi même si NODE_ENV !== production',
    );
  }
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(clientIndexPath);
  });
} else if (env.NODE_ENV === 'production') {
  logger.error({ clientDist }, 'Build client introuvable en production');
}

// 4. Error handler — toujours en dernier
app.use(errorHandler);

// 5. http.Server partagé (Express + Socket.io)
const server = http.createServer(app);
createSocketServer(server, env.APP_DOMAIN);

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Serveur démarré');
});

const shutdown = (signal: string) => {
  logger.info({ signal }, 'Arrêt du serveur');
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
