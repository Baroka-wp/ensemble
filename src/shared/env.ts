import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),
  APP_DOMAIN: z.string().url().default('http://localhost:5173'),
  DISCOUNT_MIN: z.coerce.number().int().min(0).max(100).default(5),
  DISCOUNT_MAX: z.coerce.number().int().min(0).max(100).default(50),
  REWARD_MAX_CENTS: z.coerce.number().int().nonnegative().default(10000),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Variables d’environnement invalides :');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
