import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import type { RestaurantPublicInfo } from '../../../shared/schemas/scan';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';
import { ReviewInlineForm } from '../../components/ReviewInlineForm';
import { forgetTicketForSlug, getTicketForSlug } from '../../lib/visitedTickets';

/**
 * Page d'avis dédiée — accessible via le lien court /a/:ticketCode qui redirige ici.
 * On retrouve le ticketCode dans le store local (déposé par /a/...) puis on affiche
 * le formulaire standalone. Si pas de ticket en local, on guide le client vers le scan.
 */
export function ReviewFormPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const restoQuery = useQuery({
    queryKey: ['public', 'restaurant', slug],
    queryFn: () => apiFetch<RestaurantPublicInfo>(`/public/restaurants/${slug}`),
    retry: false,
  });

  if (restoQuery.isLoading) {
    return (
      <PublicPageLayout>
        <p className="text-warmgray text-xs tracking-wider2 uppercase">Chargement…</p>
      </PublicPageLayout>
    );
  }

  if (restoQuery.error || !restoQuery.data) {
    const notFound = restoQuery.error instanceof ApiError && restoQuery.error.status === 404;
    return (
      <PublicPageLayout>
        <div className="w-full max-w-md text-center">
          <BrandHeader className="mb-10" />
          <PublicCard>
            <h1 className="font-sans font-thin text-2xl tracking-wider2 text-espresso">
              {notFound ? 'Ce restaurant n’existe pas ou n’est plus accessible.' : 'Erreur'}
            </h1>
          </PublicCard>
        </div>
      </PublicPageLayout>
    );
  }
  const restaurant = restoQuery.data;
  const ticket = getTicketForSlug(slug);

  if (!ticket) {
    return (
      <PublicPageLayout>
        <div className="w-full max-w-md">
          <BrandHeader className="mb-8" />
          <PublicCard>
            <div className="text-center py-2">
              <h1 className="font-sans text-xl text-espresso mb-3">
                Aucun ticket trouvé sur cet appareil
              </h1>
              <p className="font-serif text-warmgray text-sm">
                Pour donner votre avis, vous devez avoir scanné le QR de {restaurant.name} sur cet appareil.
              </p>
              <Link
                to={`/s/${slug}`}
                className="mt-8 inline-flex items-center justify-center rounded-full border border-espresso/15 px-6 py-3 text-xs uppercase tracking-wider2 text-espresso hover:bg-white"
              >
                Aller scanner
              </Link>
            </div>
          </PublicCard>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="w-full max-w-md">
        <BrandHeader className="mb-8 md:mb-10" />
        <PublicCard>
          <p className="text-[10px] uppercase tracking-wider2 text-warmgray text-center">
            Votre avis sur
          </p>
          <h1 className="font-sans font-thin text-3xl md:text-4xl tracking-wider2 text-espresso text-center mt-1 mb-8">
            {restaurant.name}
          </h1>
          <ReviewInlineForm
            mode={{ kind: 'withTicket', ticketCode: ticket.ticketCode }}
            restaurantName={restaurant.name}
            variant="standalone"
            onSubmitted={() => forgetTicketForSlug(slug)}
          />
        </PublicCard>
      </div>
    </PublicPageLayout>
  );
}
