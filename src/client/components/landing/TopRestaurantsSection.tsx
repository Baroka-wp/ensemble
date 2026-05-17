import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { useAudience } from './AudienceContext';
import { StarRatingDisplay } from '../StarRatingInput';
import {
  formatRating,
  type RestaurantPublicCard,
} from '../../../shared/schemas/review';

/**
 * Section "Top restaurants" : visible côté restaurant uniquement.
 * Preuve sociale qui montre des restos déjà classés grâce à ensemble.
 * Cachée si moins de 3 restaurants éligibles (pas envie d'afficher 1 seule carte gênante).
 */
export function TopRestaurantsSection() {
  const { audience } = useAudience();

  const query = useQuery({
    queryKey: ['public', 'restaurants', 'top5'],
    queryFn: () => apiFetch<{ restaurants: RestaurantPublicCard[] }>('/public/restaurants'),
    retry: false,
  });

  if (audience !== 'restaurant') return null;
  const list = (query.data?.restaurants ?? []).slice(0, 5);
  if (list.length < 3) return null;

  return (
    <section
      id="top-restos"
      className="scroll-mt-20 bg-cream py-16 sm:scroll-mt-24 sm:py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div className="max-w-xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange">Preuve sociale</p>
            <h2 className="mt-3 font-sans text-2xl font-thin tracking-wide text-espresso sm:text-3xl md:text-4xl">
              Ils ramènent déjà du monde.
            </h2>
            <p className="mt-3 font-serif text-sm text-warmgray sm:text-base">
              Les restaurants les mieux notés par les clients qui sont passés en salle.
            </p>
          </div>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-wider2 text-orange hover:text-orange-dark transition-colors md:self-end"
          >
            Voir tout l’annuaire <span aria-hidden>→</span>
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {list.map((r, idx) => (
            <li key={r.id}>
              <Link
                to={`/restaurants/${r.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-sand/80 bg-white/95 p-4 shadow-sm transition-all hover:border-orange/40 hover:shadow-lg hover:shadow-orange/10 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-[10px] text-orange tabular-nums">#{idx + 1}</span>
                  {r.ratings && (
                    <StarRatingDisplay value={Math.round(r.ratings.ratingGlobal)} size="sm" />
                  )}
                </div>
                <h3 className="font-sans text-base text-espresso group-hover:text-orange transition-colors line-clamp-2 mb-2">
                  {r.name}
                </h3>
                {r.ratings && (
                  <div className="mt-auto flex items-baseline gap-1.5 pt-2 border-t border-sand/60">
                    <span className="font-mono text-xl text-espresso tabular-nums">
                      {formatRating(r.ratings.ratingGlobal)}
                    </span>
                    <span className="text-[10px] text-warmgray">/ 5</span>
                    <span className="ml-auto text-[10px] text-warmgray tabular-nums">
                      {r.ratings.count} avis
                    </span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
