import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { DirectoryLayout } from './DirectoryLayout';
import { StarRatingDisplay } from '../../../components/StarRatingInput';
import {
  formatRating,
  PUBLIC_RANKING_MIN_REVIEWS,
  type RestaurantPublicCard,
} from '../../../../shared/schemas/review';

export function RestaurantsDirectoryPage() {
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['public', 'restaurants', search],
    queryFn: () =>
      apiFetch<{ restaurants: RestaurantPublicCard[] }>(
        `/public/restaurants${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''}`,
      ),
    retry: false,
  });

  const restaurants = query.data?.restaurants ?? [];

  return (
    <DirectoryLayout>
      <header className="mb-8 text-center sm:mb-10">
        <p className="text-[10px] uppercase tracking-[0.25em] text-orange mb-3">Annuaire</p>
        <h1 className="font-sans font-thin text-3xl tracking-wider2 text-espresso sm:text-4xl md:text-5xl">
          Les restaurants <span className="text-orange">recommandés</span>
        </h1>
        <p className="mt-3 font-serif text-warmgray text-sm sm:text-base max-w-xl mx-auto">
          Notés par de vrais clients après leur visite. Au moins {PUBLIC_RANKING_MIN_REVIEWS} avis pour
          apparaître ici.
        </p>
      </header>

      <div className="mb-6 sm:mb-8">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un restaurant…"
          className="w-full max-w-md mx-auto block px-4 py-3 bg-white border border-sand rounded-full text-espresso placeholder:text-warmgray/60 focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/15 transition-colors font-serif text-sm"
        />
      </div>

      {query.isLoading && (
        <p className="text-warmgray text-sm text-center py-12">Chargement…</p>
      )}

      {!query.isLoading && restaurants.length === 0 && (
        <div className="rounded-xl border border-dashed border-sand bg-white/60 py-16 px-6 text-center">
          <p className="text-warmgray text-sm font-serif">
            {search.trim()
              ? 'Aucun restaurant ne correspond à votre recherche.'
              : 'Aucun restaurant n’a encore reçu assez d’avis pour apparaître ici.'}
          </p>
          <p className="text-warmgray/70 text-xs mt-3 font-serif italic">
            Soyez le premier à noter votre resto préféré après votre visite.
          </p>
        </div>
      )}

      {restaurants.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r, idx) => (
            <RestaurantCard key={r.id} restaurant={r} rank={idx + 1} />
          ))}
        </ul>
      )}
    </DirectoryLayout>
  );
}

function RestaurantCard({ restaurant, rank }: { restaurant: RestaurantPublicCard; rank: number }) {
  const ratings = restaurant.ratings;
  const isTop = rank <= 3;

  return (
    <li>
      <Link
        to={`/restaurants/${restaurant.slug}`}
        className="group block rounded-2xl border border-sand/80 bg-white/95 p-5 shadow-sm transition-all hover:border-orange/40 hover:shadow-lg hover:shadow-orange/10 hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-1">
              #{rank}{isTop && ' · top resto'}
            </p>
            <h2 className="font-sans text-lg text-espresso group-hover:text-orange transition-colors truncate">
              {restaurant.name}
            </h2>
          </div>
        </div>

        {ratings && (
          <>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-sans font-thin text-3xl tracking-wider2 text-orange tabular-nums">
                {formatRating(ratings.ratingGlobal)}
              </span>
              <span className="text-xs text-warmgray">/ 5</span>
              <span className="ml-auto text-[11px] text-warmgray tabular-nums">
                {ratings.count} avis
              </span>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-sand/60">
              <Criterion label="Ambiance" value={ratings.ratingAmbiance} />
              <Criterion label="Goût" value={ratings.ratingTaste} />
              <Criterion label="Service" value={ratings.ratingService} />
            </div>
          </>
        )}
      </Link>
    </li>
  );
}

function Criterion({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-warmgray">{label}</span>
      <div className="flex items-center gap-2">
        <StarRatingDisplay value={Math.round(value)} size="sm" />
        <span className="font-mono text-espresso tabular-nums w-7 text-right">
          {formatRating(value)}
        </span>
      </div>
    </div>
  );
}
