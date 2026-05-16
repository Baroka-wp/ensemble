import type { Server as HttpServer } from 'node:http';
import { Server as IOServer } from 'socket.io';
import { logger } from '../lib/logger.js';
import { verifyToken } from '../lib/jwt.js';

let ioRef: IOServer | null = null;

export function getIo(): IOServer {
  if (!ioRef) throw new Error('Socket.io non initialisé');
  return ioRef;
}

export function createSocketServer(httpServer: HttpServer, appDomain: string): IOServer {
  const io = new IOServer(httpServer, {
    cors: { origin: appDomain, credentials: true },
  });
  ioRef = io;

  // Namespace admin : JWT restaurant → join room restaurant:{id}
  const adminNs = io.of('/admin');
  adminNs.use((socket, next) => {
    try {
      const raw = (socket.handshake.auth?.token as string | undefined) ?? '';
      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const payload = verifyToken(token);
      if (payload.type !== 'restaurant') return next(new Error('UNAUTHORIZED'));
      socket.data.restaurantId = payload.sub;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });
  adminNs.on('connection', (socket) => {
    const room = `restaurant:${socket.data.restaurantId}`;
    socket.join(room);
    logger.debug({ id: socket.id, room }, 'admin socket joined');
    socket.on('ping:health', (cb) => typeof cb === 'function' && cb({ ok: true }));
  });

  // Namespace influencer : JWT influenceur → join room influencer:{id}
  const influencerNs = io.of('/influencer');
  influencerNs.use((socket, next) => {
    try {
      const raw = (socket.handshake.auth?.token as string | undefined) ?? '';
      const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
      const payload = verifyToken(token);
      if (payload.type !== 'influencer') return next(new Error('UNAUTHORIZED'));
      socket.data.influencerId = payload.sub;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });
  influencerNs.on('connection', (socket) => {
    const room = `influencer:${socket.data.influencerId}`;
    socket.join(room);
    logger.debug({ id: socket.id, room }, 'influencer socket joined');
  });

  return io;
}
