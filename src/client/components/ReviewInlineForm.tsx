import { useEffect, useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../lib/api';
import { getVisitorId } from '../lib/fingerprint';
import { StarRatingInput } from './StarRatingInput';
import {
  createFreeReviewInput,
  createReviewInput,
  type ReviewPublic,
} from '../../shared/schemas/review';

/**
 * Deux modes de soumission :
 *  - withTicket : POST /public/reviews avec ticketCode (avis post-ticket)
 *  - free       : POST /public/restaurants/:slug/reviews (avis sans code, juste depuis /s/:slug)
 */
type SubmitMode =
  | { kind: 'withTicket'; ticketCode: string }
  | { kind: 'free'; slug: string };

interface Props {
  mode: SubmitMode;
  restaurantName: string;
  /** Présentation : inline (sous le ticket) ou standalone (page dédiée). */
  variant?: 'inline' | 'standalone';
  /** Callback après soumission réussie (ex: forgetTicketForSlug). */
  onSubmitted?: () => void;
}

/**
 * Formulaire d'avis réutilisable.
 * - inline : embarqué dans une autre page (TicketScreen). Pas de bord externe.
 * - standalone : sur sa propre page (/s/{slug}/avis). Avec card englobante.
 */
export function ReviewInlineForm({
  mode,
  restaurantName,
  variant = 'inline',
  onSubmitted,
}: Props) {
  const [ambiance, setAmbiance] = useState(0);
  const [taste, setTaste] = useState(0);
  const [service, setService] = useState(0);
  const [comment, setComment] = useState('');
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [fpError, setFpError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getVisitorId()
      .then((v) => !cancelled && setVisitorId(v))
      .catch(() => !cancelled && setFpError('Identification de l’appareil impossible'));
    return () => {
      cancelled = true;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (vars: {
      ratingAmbiance: number;
      ratingTaste: number;
      ratingService: number;
      comment?: string;
      fingerprint: string;
    }) => {
      if (mode.kind === 'withTicket') {
        return apiFetch<{ review: ReviewPublic }>('/public/reviews', {
          method: 'POST',
          body: { ...vars, ticketCode: mode.ticketCode },
        });
      }
      return apiFetch<{ review: ReviewPublic }>(
        `/public/restaurants/${mode.slug}/reviews`,
        { method: 'POST', body: vars },
      );
    },
    onSuccess: () => {
      setSubmitted(true);
      onSubmitted?.();
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : 'Erreur inattendue. Réessayez.'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!visitorId) {
      setError('Identification en cours…');
      return;
    }
    const base = {
      fingerprint: visitorId,
      ratingAmbiance: ambiance,
      ratingTaste: taste,
      ratingService: service,
      comment: comment.trim().length > 0 ? comment.trim() : undefined,
    };
    const parsed =
      mode.kind === 'withTicket'
        ? createReviewInput.safeParse({ ...base, ticketCode: mode.ticketCode })
        : createFreeReviewInput.safeParse(base);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Saisie invalide');
      return;
    }
    mutation.mutate(base);
  };

  // --- État succès : message visuel persistant ---
  if (submitted) {
    return (
      <ContainerForVariant variant={variant}>
        <div className="text-center py-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage mb-4">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-sans text-base text-espresso font-medium mb-1">
            Merci pour votre avis
          </p>
          <p className="font-serif text-sm text-warmgray">
            Il aidera d’autres clients à choisir <strong>{restaurantName}</strong>.
          </p>
        </div>
      </ContainerForVariant>
    );
  }

  // --- Erreur fingerprint hard ---
  if (fpError) {
    return (
      <ContainerForVariant variant={variant}>
        <p className="text-sm font-serif text-warmgray text-center">{fpError}</p>
      </ContainerForVariant>
    );
  }

  // --- Formulaire ---
  const allRated = ambiance > 0 && taste > 0 && service > 0;

  return (
    <ContainerForVariant variant={variant}>
      <div className="text-left">
        {variant === 'inline' && (
          <div className="mb-5 text-left">
            <p className="font-sans text-base text-espresso font-medium">
              Votre avis sur {restaurantName}
            </p>
            <p className="font-serif text-xs text-warmgray mt-0.5">
              Quelques étoiles, ça nous aide énormément.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <StarRatingInput value={ambiance} onChange={setAmbiance} label="Ambiance" />
          <StarRatingInput value={taste} onChange={setTaste} label="Goût" />
          <StarRatingInput value={service} onChange={setService} label="Service" />

          <div>
            <label
              htmlFor={`comment-${variant}`}
              className="block text-xs uppercase tracking-wider2 text-warmgray mb-2 font-medium"
            >
              Commentaire{' '}
              <span className="text-warmgray/60 normal-case lowercase">(optionnel)</span>
            </label>
            <textarea
              id={`comment-${variant}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Quelque chose à partager ?"
              className="w-full px-4 py-3 bg-white border border-sand rounded-lg text-espresso placeholder:text-warmgray/60 focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/15 transition-colors font-serif text-sm"
            />
            <p className="mt-1 text-[10px] text-warmgray/70 text-right tabular-nums">
              {comment.length} / 1000
            </p>
          </div>

          {error && (
            <p className="px-4 py-3 bg-halo/30 border border-halo/80 rounded-lg text-sm font-serif text-espresso">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!allRated || mutation.isPending || !visitorId}
            className="w-full px-6 py-3.5 bg-orange text-cream rounded-full text-xs tracking-wider2 uppercase font-medium hover:bg-orange-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange/25"
          >
            {mutation.isPending ? 'Envoi…' : 'Publier mon avis'}
          </button>
        </form>
      </div>
    </ContainerForVariant>
  );
}

function ContainerForVariant({
  variant,
  children,
}: {
  variant: 'inline' | 'standalone';
  children: React.ReactNode;
}) {
  if (variant === 'standalone') return <>{children}</>;
  return (
    <div className="rounded-2xl border border-sand bg-white/90 px-5 py-6 sm:px-6 sm:py-7 shadow-sm">
      {children}
    </div>
  );
}
