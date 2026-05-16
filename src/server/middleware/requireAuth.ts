import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { HttpError } from './errorHandler.js';

declare module 'express-serve-static-core' {
  interface Request {
    restaurantId?: string;
    restaurantEmail?: string;
    influencerId?: string;
    influencerEmail?: string;
  }
}

function extractToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Token manquant');
  }
  return header.slice('Bearer '.length).trim();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const payload = verifyToken(extractToken(req));
    if (payload.type !== 'restaurant') {
      throw new HttpError(403, 'WRONG_TOKEN_TYPE', 'Ce token n’est pas un token restaurant');
    }
    req.restaurantId = payload.sub;
    req.restaurantEmail = payload.email;
    next();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'UNAUTHORIZED', 'Token invalide ou expiré');
  }
}

export function requireInfluencerAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const payload = verifyToken(extractToken(req));
    if (payload.type !== 'influencer') {
      throw new HttpError(403, 'WRONG_TOKEN_TYPE', 'Ce token n’est pas un token influenceur');
    }
    req.influencerId = payload.sub;
    req.influencerEmail = payload.email;
    next();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'UNAUTHORIZED', 'Token invalide ou expiré');
  }
}
