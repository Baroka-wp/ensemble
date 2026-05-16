import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export class HttpError extends Error {
  constructor(public status: number, public code: string, message?: string) {
    super(message ?? code);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Requête invalide', details: err.flatten() });
    return;
  }
  logger.error({ err }, 'Erreur non gérée');
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erreur serveur' });
};
