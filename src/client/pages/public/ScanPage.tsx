import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { getVisitorId } from '../../lib/fingerprint';
import {
  SCAN_ERROR_CODES,
  type RestaurantPublicInfo,
  type TicketPublic,
} from '../../../shared/schemas/scan';
import { TicketScreen } from './TicketScreen';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';

function errorMessage(code: string, fallback: string) {
  return (SCAN_ERROR_CODES as Record<string, string>)[code] ?? fallback;
}

export function ScanPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [code, setCode] = useState('');
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [fpError, setFpError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketPublic | null>(null);

  const restoQuery = useQuery({
    queryKey: ['public', 'restaurant', slug],
    queryFn: () => apiFetch<RestaurantPublicInfo>(`/public/restaurants/${slug}`),
    retry: false,
  });

  useEffect(() => {
    let cancelled = false;
    getVisitorId()
      .then((v) => {
        if (!cancelled) setVisitorId(v);
      })
      .catch(() => {
        if (!cancelled)
          setFpError('Impossible d’identifier votre appareil. Activez JavaScript ou essayez un autre navigateur.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutation = useMutation({
    mutationFn: (input: { slug: string; influencerCode: string; fingerprint: string }) =>
      apiFetch<{ ticket: TicketPublic }>('/public/scan', { method: 'POST', body: input }),
    onSuccess: ({ ticket }) => setTicket(ticket),
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(errorMessage(err.code, err.message));
      } else {
        setError('Erreur inattendue. Réessayez.');
      }
    },
  });

  if (ticket) return <TicketScreen ticket={ticket} />;

  if (restoQuery.isLoading) {
    return (
      <PublicPageLayout>
        <p className="text-warmgray text-xs tracking-wider2 uppercase">Chargement…</p>
      </PublicPageLayout>
    );
  }

  if (restoQuery.error || !restoQuery.data) {
    return (
      <PublicPageLayout>
        <div className="w-full max-w-md text-center">
          <BrandHeader className="mb-10" />
          <PublicCard>
            <h1 className="font-sans font-thin text-2xl tracking-wider2 text-espresso">
              {SCAN_ERROR_CODES.RESTAURANT_NOT_FOUND}
            </h1>
          </PublicCard>
        </div>
      </PublicPageLayout>
    );
  }

  const restaurant = restoQuery.data;
  const trimmed = code.trim();
  const submitDisabled = !visitorId || mutation.isPending || trimmed.length < 3;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!visitorId) {
      setError('Identification de l’appareil en cours…');
      return;
    }
    mutation.mutate({ slug: restaurant.slug, influencerCode: trimmed, fingerprint: visitorId });
  };

  return (
    <PublicPageLayout>
      <div className="w-full max-w-md">
        <BrandHeader className="mb-8 md:mb-10" />
        <PublicCard>
          <p className="text-[10px] uppercase tracking-wider2 text-warmgray text-center">Bienvenue chez</p>
          <h1 className="font-sans font-thin text-4xl md:text-5xl tracking-wider2 text-espresso text-center mt-2 mb-8">
            {restaurant.name}
          </h1>

          <form onSubmit={onSubmit} noValidate>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider2 text-warmgray mb-3 text-center">
                Code influenceur
              </span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                placeholder="MARIE7K"
                className="w-full px-4 py-5 bg-cream/50 border border-sand rounded-xl text-espresso text-center text-2xl font-mono tracking-[0.2em] uppercase focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/15 transition-colors"
                aria-label="Code influenceur"
                required
              />
            </label>

            {(error || fpError) && (
              <p className="mt-4 px-4 py-3 bg-halo/30 border border-halo/80 rounded-lg text-sm font-serif text-espresso text-center">
                {error ?? fpError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitDisabled}
              className="mt-6 w-full px-6 py-4 bg-orange text-cream rounded-full text-xs tracking-wider2 uppercase font-medium hover:bg-orange-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange/25"
            >
              {mutation.isPending ? 'Création du ticket…' : 'Obtenir ma réduction'}
            </button>
          </form>
        </PublicCard>
      </div>
    </PublicPageLayout>
  );
}
