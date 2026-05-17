import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { StarRatingDisplay } from '../../components/StarRatingInput';
import {
  formatRating,
  PUBLIC_RANKING_MIN_REVIEWS,
  type ReviewAdmin,
  type ReviewsAdminPage,
  type ReviewsAdminStats,
} from '../../../shared/schemas/review';

type Tab = 'visible' | 'hidden';

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function ReviewsPage() {
  const [tab, setTab] = useState<Tab>('visible');

  const statsQuery = useQuery({
    queryKey: ['admin', 'reviews', 'stats'],
    queryFn: () => apiFetch<ReviewsAdminStats>('/admin/reviews/stats', { auth: true }),
  });

  const listQuery = useQuery({
    queryKey: ['admin', 'reviews', tab],
    queryFn: () =>
      apiFetch<ReviewsAdminPage>(
        `/admin/reviews?hidden=${tab === 'hidden' ? 'true' : 'false'}`,
        { auth: true },
      ),
  });

  const stats = statsQuery.data;

  return (
    <section className="max-w-4xl space-y-6">
      {/* Header avec note globale */}
      {stats && stats.ratings && (
        <div className="rounded-2xl border border-sand/80 bg-white/95 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-baseline gap-2">
              <span className="font-sans font-thin text-4xl tracking-wider2 text-orange tabular-nums sm:text-5xl">
                {formatRating(stats.ratings.ratingGlobal)}
              </span>
              <span className="text-sm text-warmgray">/ 5</span>
            </div>
            <div className="flex flex-col gap-1">
              <StarRatingDisplay value={Math.round(stats.ratings.ratingGlobal)} />
              <span className="text-xs text-warmgray">
                {stats.ratings.count} avis visible{stats.ratings.count > 1 ? 's' : ''}
                {stats.totalHidden > 0 ? ` · ${stats.totalHidden} masqué${stats.totalHidden > 1 ? 's' : ''}` : ''}
              </span>
            </div>
            <div className="ml-auto grid grid-cols-3 gap-x-4 gap-y-1 text-[11px]">
              <CriterionMini label="Ambiance" value={stats.ratings.ratingAmbiance} />
              <CriterionMini label="Goût" value={stats.ratings.ratingTaste} />
              <CriterionMini label="Service" value={stats.ratings.ratingService} />
            </div>
          </div>
          {stats.ratings.count < PUBLIC_RANKING_MIN_REVIEWS && (
            <p className="mt-4 pt-4 border-t border-sand/60 text-xs text-warmgray font-serif italic">
              Encore {PUBLIC_RANKING_MIN_REVIEWS - stats.ratings.count} avis pour apparaître dans
              l’annuaire public.
            </p>
          )}
        </div>
      )}

      {stats && !stats.ratings && (
        <div className="rounded-2xl border border-dashed border-sand bg-white/60 p-8 text-center">
          <p className="text-warmgray text-sm font-serif">
            Vous n’avez pas encore reçu d’avis clients.
          </p>
          <p className="text-warmgray/70 text-xs mt-2 font-serif italic">
            Les clients peuvent noter 2 h après avoir scanné votre QR.
          </p>
        </div>
      )}

      {/* Tabs */}
      <nav className="inline-flex rounded-full border border-sand bg-white/80 p-1 text-xs">
        <TabButton current={tab} value="visible" count={stats?.totalVisible} onChange={setTab}>
          Visibles
        </TabButton>
        <TabButton current={tab} value="hidden" count={stats?.totalHidden} onChange={setTab}>
          Masqués
        </TabButton>
      </nav>

      {/* Liste */}
      {listQuery.isLoading && <p className="text-warmgray text-sm">Chargement…</p>}

      {listQuery.data && listQuery.data.reviews.length === 0 && (
        <p className="text-sm text-warmgray text-center py-12 rounded-xl border border-dashed border-sand bg-white/60">
          {tab === 'hidden' ? 'Aucun avis masqué.' : 'Aucun avis pour le moment.'}
        </p>
      )}

      {listQuery.data && listQuery.data.reviews.length > 0 && (
        <ul className="space-y-3">
          {listQuery.data.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TabButton({
  current,
  value,
  count,
  onChange,
  children,
}: {
  current: Tab;
  value: Tab;
  count?: number;
  onChange: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={[
        'px-3 py-1.5 rounded-full uppercase tracking-wider2 transition-colors flex items-center gap-1.5',
        active ? 'bg-espresso text-cream' : 'text-warmgray hover:text-espresso',
      ].join(' ')}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={[
            'inline-flex items-center justify-center text-[10px] min-w-[18px] px-1.5 py-0.5 rounded-full',
            active ? 'bg-cream/20 text-cream' : 'bg-sand/80 text-warmgray',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function CriterionMini({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span className="text-warmgray">{label}</span>
      <span className="font-mono text-espresso tabular-nums col-span-2">
        {formatRating(value)} / 5
      </span>
    </>
  );
}

function ReviewCard({ review }: { review: ReviewAdmin }) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
  };
  const hideMut = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/reviews/${review.id}/hide`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });
  const unhideMut = useMutation({
    mutationFn: () =>
      apiFetch(`/admin/reviews/${review.id}/unhide`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });

  return (
    <li className="rounded-2xl border border-sand/80 bg-white/95 p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <StarRatingDisplay value={Math.round(review.ratingGlobal)} />
          <span className="font-mono text-sm text-espresso tabular-nums">
            {formatRating(review.ratingGlobal)} / 5
          </span>
        </div>
        <span className="text-[11px] text-warmgray tabular-nums">
          {formatDateTime(review.createdAt)}
        </span>
      </header>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-warmgray mb-3">
        <span>Ambiance · <span className="text-espresso tabular-nums">{review.ratingAmbiance}/5</span></span>
        <span>Goût · <span className="text-espresso tabular-nums">{review.ratingTaste}/5</span></span>
        <span>Service · <span className="text-espresso tabular-nums">{review.ratingService}/5</span></span>
      </div>

      {review.comment ? (
        <p className="font-serif text-sm text-espresso leading-relaxed mt-3 pt-3 border-t border-sand/60">
          {review.comment}
        </p>
      ) : (
        <p className="font-serif text-xs text-warmgray/70 italic mt-2">
          Pas de commentaire écrit.
        </p>
      )}

      {review.comment && (
        <div className="mt-4 pt-3 border-t border-sand/60 flex flex-wrap items-center gap-3">
          {!review.hidden ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Masquer ce commentaire ? Les notes resteront comptabilisées dans votre moyenne publique.')) {
                  hideMut.mutate();
                }
              }}
              disabled={hideMut.isPending}
              className="text-xs uppercase tracking-wider2 text-warmgray hover:text-wine transition-colors disabled:opacity-50"
            >
              {hideMut.isPending ? 'Masquage…' : 'Masquer le commentaire'}
            </button>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider2 px-2 py-1 rounded-full border border-wine/30 bg-wine/5 text-wine">
                Commentaire masqué
              </span>
              <button
                type="button"
                onClick={() => unhideMut.mutate()}
                disabled={unhideMut.isPending}
                className="text-xs uppercase tracking-wider2 text-warmgray hover:text-sage transition-colors disabled:opacity-50"
              >
                {unhideMut.isPending ? '…' : 'Rétablir'}
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
