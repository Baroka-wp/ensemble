import { z } from 'zod';

export const registerInput = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Mot de passe : 8 caractères minimum')
    .max(128, 'Mot de passe trop long'),
  restaurantName: z
    .string()
    .trim()
    .min(2, 'Nom du restaurant : 2 caractères minimum')
    .max(80, 'Nom du restaurant trop long'),
});
export type RegisterInput = z.infer<typeof registerInput>;

export const loginInput = z.object({
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
export type LoginInput = z.infer<typeof loginInput>;

export const restaurantPublic = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type RestaurantPublic = z.infer<typeof restaurantPublic>;

export const authResponse = z.object({
  token: z.string(),
  restaurant: restaurantPublic,
});
export type AuthResponse = z.infer<typeof authResponse>;
