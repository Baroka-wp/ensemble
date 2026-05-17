import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../lib/api';
import type { RestaurantPublicInfo } from '../../../shared/schemas/scan';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';
import { ReviewInlineForm } from '../../components/ReviewInlineForm';

/**
 * Page d'avis libre (sans code influenceur, sans ticket).
 * Accessible depuis /s/:slug (lien secondaire sous le formulaire scan).
 * Le QR du restaurant étant physiquement en salle, le scan = preuve de visite.
 */
export function FreeReviewPage() {
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

  return (
    <PublicPageLayout>
      <div className="w-full max-w-md">
        <BrandHeader className="mb-8 md:mb-10" />

        <Link
          to={`/s/${slug}`}
          className="inline-block mb-4 text-[10px] uppercase tracking-wider2 text-warmgray hover:text-orange transition-colors"
        >
          ← Retour
        </Link>

        <PublicCard>
          <p className="text-[10px] uppercase tracking-wider2 text-warmgray text-center">
            Votre avis sur
          </p>
          <h1 className="font-sans font-thin text-3xl md:text-4xl tracking-wider2 text-espresso text-center mt-1 mb-2">
            {restaurant.name}
          </h1>
          <p className="font-serif text-xs text-warmgray text-center mb-8">
            Sans code influenceur — votre passage en salle suffit.
          </p>
          <ReviewInlineForm
            mode={{ kind: 'free', slug }}
            restaurantName={restaurant.name}
            variant="standalone"
          />
        </PublicCard>
      </div>
    </PublicPageLayout>
  );
}
