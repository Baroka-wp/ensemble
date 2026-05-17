import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch, ApiError } from '../../../lib/api';
import { DirectoryLayout } from './DirectoryLayout';
import { StarRatingDisplay } from '../../../components/StarRatingInput';
import {
  formatRating,
  PUBLIC_RANKING_MIN_REVIEWS,
  type RestaurantPublicDetails,
} from '../../../../shared/schemas/review';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function RestaurantDetailsPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: ['public', 'restaurant-details', slug],
    queryFn: () =>
      apiFetch<RestaurantPublicDetails>(`/public/restaurants/${slug}/details`),
    retry: false,
  });

  if (query.isLoading) {
    return (
      <DirectoryLayout>
        <p className="text-warmgray text-sm text-center py-12">Chargement…</p>
      </DirectoryLayout>
    );
  }

  if (query.error || !query.data) {
    const notFound = query.error instanceof ApiError && query.error.status === 404;
    return (
      <DirectoryLayout>
        <div className="text-center py-16">
          <h1 className="font-sans font-thin text-2xl text-espresso mb-3">
            {notFound ? 'Restaurant introuvable' : 'Erreur de chargement'}
          </h1>
          <p className="text-warmgray text-sm font-serif mb-8">
            {notFound
              ? 'Ce restaurant n’existe pas ou n’est plus actif.'
              : 'Impossible de charger les informations.'}
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center justify-center rounded-full bg-orange text-cream px-6 py-3 text-xs uppercase tracking-wider2 hover:bg-orange-dark transition-colors"
          >
            ← Annuaire des restaurants
          </Link>
        </div>
      </DirectoryLayout>
    );
  }

  const d = query.data;
  const hasRatings = d.ratings !== null;
  const visibleReviews = d.reviews.filter((r) => r.comment !== null || true); // notes toujours visibles

  return (
    <DirectoryLayout>
      {/* Header restaurant */}
      <header className="mb-10">
        <Link
          to="/restaurants"
          className="inline-block text-[10px] uppercase tracking-wider2 text-warmgray hover:text-orange mb-4"
        >
          ← Annuaire
        </Link>
        <h1 className="font-sans font-thin text-4xl tracking-wider2 text-espresso sm:text-5xl">
          {d.name}
        </h1>

        {hasRatings && d.ratings ? (
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-thin text-5xl tracking-wider2 text-orange tabular-nums sm:text-6xl">
                {formatRating(d.ratings.ratingGlobal)}
              </span>
              <span className="text-sm text-warmgray">/ 5</span>
            </div>
            <div className="flex flex-col gap-1">
              <StarRatingDisplay value={Math.round(d.ratings.ratingGlobal)} />
              <span className="text-xs text-warmgray tabular-nums">
                {d.ratings.count} avis vérifiés
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-warmgray font-serif italic">
            Pas encore assez d’avis pour afficher une note (minimum {PUBLIC_RANKING_MIN_REVIEWS}).
          </p>
        )}
      </header>

      {/* Détail des notes */}
      {hasRatings && d.ratings && (
        <section className="mb-12 rounded-2xl border border-sand/80 bg-white/95 p-5 sm:p-7 shadow-sm">
          <h2 className="text-[10px] uppercase tracking-wider2 text-warmgray mb-5">Notes par critère</h2>
          <div className="space-y-4">
            <CriterionRow label="Ambiance" value={d.ratings.ratingAmbiance} />
            <CriterionRow label="Goût" value={d.ratings.ratingTaste} />
            <CriterionRow label="Service" value={d.ratings.ratingService} />
          </div>
        </section>
      )}

      {/* Liste des avis */}
      <section>
        <h2 className="font-sans text-xl text-espresso mb-5">
          Avis clients <span className="text-warmgray text-sm">({d.reviews.length})</span>
        </h2>

        {d.reviews.length === 0 ? (
          <p className="text-sm text-warmgray text-center py-12 rounded-xl border border-dashed border-sand bg-white/60">
            Aucun avis pour ce restaurant pour l’instant.
          </p>
        ) : (
          <ul className="space-y-4">
            {visibleReviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-sand/80 bg-white/95 p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <StarRatingDisplay value={Math.round(r.ratingGlobal)} />
                    <span className="font-mono text-sm text-espresso tabular-nums">
                      {formatRating(r.ratingGlobal)} / 5
                    </span>
                  </div>
                  <span className="text-[11px] text-warmgray tabular-nums">
                    {formatDate(r.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-warmgray mb-3">
                  <span>Ambiance · <span className="text-espresso tabular-nums">{r.ratingAmbiance}/5</span></span>
                  <span>Goût · <span className="text-espresso tabular-nums">{r.ratingTaste}/5</span></span>
                  <span>Service · <span className="text-espresso tabular-nums">{r.ratingService}/5</span></span>
                </div>

                {r.comment ? (
                  <p className="font-serif text-sm text-espresso leading-relaxed mt-3 pt-3 border-t border-sand/60">
                    {r.comment}
                  </p>
                ) : (
                  <p className="font-serif text-xs text-warmgray/70 italic mt-2">
                    Commentaire masqué par le restaurant.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </DirectoryLayout>
  );
}

function CriterionRow({ label, value }: { label: string; value: number }) {
  // Affichage barre de progression visuelle (note / 5)
  const pct = (value / 5) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-espresso font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <StarRatingDisplay value={Math.round(value)} size="sm" />
          <span className="font-mono text-espresso tabular-nums w-10 text-right">
            {formatRating(value)}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-sand/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange rounded-full transition-all"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
