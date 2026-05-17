import { useEffect, useState } from 'react';
import type { TicketPublic } from '../../../shared/schemas/scan';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';
import { ReviewInlineForm } from '../../components/ReviewInlineForm';
import { useClipboard } from '../../lib/clipboard';

function formatExpiry(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function TicketScreen({ ticket }: { ticket: TicketPublic }) {
  const { copy, copied } = useClipboard();
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const remainingMs = new Date(ticket.expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      window.location.reload();
      return;
    }
    const timer = window.setTimeout(() => window.location.reload(), remainingMs);
    return () => window.clearTimeout(timer);
  }, [ticket.expiresAt]);

  const shortPath = `/a/${ticket.code}`;
  const fullUrl = origin ? `${origin}${shortPath}` : shortPath;

  return (
    <PublicPageLayout>
      <div
        className="w-full max-w-md text-center"
        style={{ touchAction: 'manipulation' }}
      >
        <BrandHeader className="mb-8 md:mb-10" />
        <PublicCard>
          <p className="text-xs uppercase tracking-wider2 text-warmgray mb-4">{ticket.restaurantName}</p>

          <p className="font-serif text-warmgray mb-2">Réduction</p>
          <p className="font-sans font-thin text-7xl md:text-8xl tracking-wider2 text-orange mb-8 leading-none">
            −{ticket.discountPercent} %
          </p>

          <div className="rounded-xl border border-sand bg-cream/40 px-6 py-8 mb-8">
            <p className="text-[10px] uppercase tracking-wider2 text-warmgray mb-3">Code ticket</p>
            <p className="font-mono text-3xl md:text-4xl text-espresso select-all break-all leading-tight">
              {ticket.code}
            </p>
          </div>

          <p className="font-serif text-espresso text-lg mb-2">Montrez cet écran en caisse</p>
          <p className="font-serif text-warmgray text-sm">Valable jusqu’au {formatExpiry(ticket.expiresAt)}</p>
        </PublicCard>

        {/* Formulaire d'avis inline — pas de redirection, pas d'attente */}
        <div className="mt-6">
          <ReviewInlineForm
            mode={{ kind: 'withTicket', ticketCode: ticket.code }}
            restaurantName={ticket.restaurantName}
            variant="inline"
          />
        </div>

        {/* Lien à conserver si le client préfère noter plus tard depuis un autre device/onglet */}
        <details className="mt-4 group">
          <summary className="cursor-pointer list-none text-[11px] uppercase tracking-wider2 text-warmgray/80 hover:text-orange transition-colors">
            Préférez noter plus tard ?
            <span className="ml-1 inline-block transition-transform group-open:rotate-90">→</span>
          </summary>
          <div className="mt-3 rounded-xl border border-sand bg-cream/50 px-4 py-3 text-left">
            <p className="font-serif text-xs text-warmgray mb-2 text-center">
              Sauvegardez ce lien pour revenir noter quand vous voulez.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-sand bg-white px-3 py-2">
              <code className="font-mono text-[11px] text-warmgray truncate flex-1 select-all">
                {fullUrl}
              </code>
              <button
                type="button"
                onClick={() => copy(fullUrl, 'review-link')}
                className="shrink-0 text-[10px] uppercase tracking-wider2 text-orange hover:text-orange-dark"
              >
                {copied === 'review-link' ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>
        </details>

        <p className="font-serif text-xs text-warmgray mt-8">Ticket valable 1 h.</p>
      </div>
    </PublicPageLayout>
  );
}
