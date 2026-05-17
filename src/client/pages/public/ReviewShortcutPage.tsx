import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import { rememberTicket } from '../../lib/visitedTickets';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';

interface ResolveResponse {
  slug: string;
  restaurantName: string;
  scanCreatedAt: string;
}

/**
 * Route courte `/a/:ticketCode` partagée sur le ticket.
 * - Résout le slug du restaurant via l'API
 * - S'assure que le ticket est en mémoire locale (au cas où l'utilisateur
 *   clique depuis un autre onglet du même navigateur)
 * - Redirige vers /s/{slug}/avis
 */
export function ReviewShortcutPage() {
  const { ticketCode = '' } = useParams<{ ticketCode: string }>();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['public', 'ticket-resolve', ticketCode],
    queryFn: () => apiFetch<ResolveResponse>(`/public/tickets/${ticketCode}/resolve`),
    retry: false,
    enabled: Boolean(ticketCode),
  });

  useEffect(() => {
    if (!query.data) return;
    // Mémorise le ticket localement (sera vérifié par la page avis).
    rememberTicket({
      ticketCode: ticketCode.toUpperCase(),
      restaurantSlug: query.data.slug,
      createdAt: new Date(query.data.scanCreatedAt).getTime(),
    });
    // Redirige sans pousser dans l'historique
    navigate(`/s/${query.data.slug}/avis`, { replace: true });
  }, [query.data, ticketCode, navigate]);

  if (query.isLoading) {
    return (
      <PublicPageLayout>
        <p className="text-warmgray text-xs tracking-wider2 uppercase">Chargement…</p>
      </PublicPageLayout>
    );
  }

  if (query.error || !query.data) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <PublicPageLayout>
        <div className="w-full max-w-md text-center">
          <BrandHeader className="mb-10" />
          <PublicCard>
            <h1 className="font-sans font-thin text-2xl tracking-wider2 text-espresso mb-3">
              {notFound ? 'Lien d’avis introuvable' : 'Erreur de chargement'}
            </h1>
            <p className="text-sm font-serif text-warmgray">
              {notFound
                ? 'Ce lien ne correspond à aucun ticket. Il a peut-être expiré.'
                : 'Réessayez plus tard.'}
            </p>
          </PublicCard>
        </div>
      </PublicPageLayout>
    );
  }

  // Pendant la redirection
  return (
    <PublicPageLayout>
      <p className="text-warmgray text-xs tracking-wider2 uppercase">Redirection…</p>
    </PublicPageLayout>
  );
}
