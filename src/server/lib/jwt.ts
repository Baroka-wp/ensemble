import jwt from 'jsonwebtoken';
import { loadEnv } from '../../shared/env.js';

const env = loadEnv();
const SECRET = env.JWT_SECRET;
const EXPIRES_IN = '7d';

export type JwtType = 'restaurant' | 'influencer';

export interface RestaurantJwtPayload {
  sub: string;
  email: string;
  type: 'restaurant';
}
export interface InfluencerJwtPayload {
  sub: string;
  email: string;
  type: 'influencer';
}
export type AnyJwtPayload = RestaurantJwtPayload | InfluencerJwtPayload;

export function signToken(payload: AnyJwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): AnyJwtPayload {
  const decoded = jwt.verify(token, SECRET);
  if (
    typeof decoded === 'string' ||
    !decoded.sub ||
    typeof decoded.sub !== 'string' ||
    !('type' in decoded) ||
    (decoded.type !== 'restaurant' && decoded.type !== 'influencer')
  ) {
    throw new Error('Token mal formé');
  }
  return {
    sub: decoded.sub,
    email: (decoded as { email?: string }).email ?? '',
    type: decoded.type,
  } as AnyJwtPayload;
}
