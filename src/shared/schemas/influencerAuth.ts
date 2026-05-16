import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Email invalide');
const password = z.string().min(8, 'Mot de passe : 8 caractères minimum').max(128, 'Mot de passe trop long');
const displayName = z.string().trim().min(2, 'Nom : 2 caractères minimum').max(80, 'Nom trop long');

export const influencerRegisterInput = z.object({
  email,
  password,
  displayName,
});
export type InfluencerRegisterInput = z.infer<typeof influencerRegisterInput>;

export const influencerLoginInput = z.object({
  email,
  password: z.string().min(1, 'Mot de passe requis'),
});
export type InfluencerLoginInput = z.infer<typeof influencerLoginInput>;

/** Session : profil influenceur sans le détail des collabs (chargées séparément). */
export const influencerSession = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
});
export type InfluencerSession = z.infer<typeof influencerSession>;

export const influencerAuthResponse = z.object({
  token: z.string(),
  influencer: influencerSession,
});
export type InfluencerAuthResponse = z.infer<typeof influencerAuthResponse>;

export const updateInfluencerProfileInput = z
  .object({
    displayName: displayName.optional(),
    email: email.optional(),
    password: password.optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: 'Au moins un champ requis',
  });
export type UpdateInfluencerProfileInput = z.infer<typeof updateInfluencerProfileInput>;
