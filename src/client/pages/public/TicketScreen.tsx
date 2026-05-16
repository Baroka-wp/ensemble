import { useEffect } from 'react';
import type { TicketPublic } from '../../../shared/schemas/scan';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';

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
  useEffect(() => {
    const remainingMs = new Date(ticket.expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      window.location.reload();
      return;
    }
    const timer = window.setTimeout(() => window.location.reload(), remainingMs);
    return () => window.clearTimeout(timer);
  }, [ticket.expiresAt]);

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

        <p className="font-serif text-xs text-warmgray mt-8">Ticket valable 1 h.</p>
      </div>
    </PublicPageLayout>
  );
}
