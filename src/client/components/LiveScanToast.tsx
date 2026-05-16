import { useEffect, useState } from 'react';
import type { ScanCreatedEvent } from '../../shared/schemas/scan';
import { formatFCFA } from '../../shared/schemas/influencer';

export function LiveBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider2 px-2 py-1 rounded-full border',
        connected ? 'border-halo/40 text-deepspace' : 'border-deepspace/5 text-warmgray',
      ].join(' ')}
      aria-live="polite"
    >
      <span
        className={[
          'w-1.5 h-1.5 rounded-full',
          connected ? 'bg-halo animate-pulse' : 'bg-warmgray/40',
        ].join(' ')}
      />
      {connected ? 'Live' : 'Hors ligne'}
    </span>
  );
}

export function LiveScanToast({
  scan,
  variant = 'admin',
}: {
  scan: ScanCreatedEvent | null;
  variant?: 'admin' | 'influencer';
}) {
  const [visible, setVisible] = useState<ScanCreatedEvent | null>(null);

  useEffect(() => {
    if (!scan) return;
    setVisible(scan);
    const id = setTimeout(() => setVisible(null), 4000);
    return () => clearTimeout(id);
  }, [scan]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-deepspace text-mica shadow-lg flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]"
    >
      <span className="w-2 h-2 rounded-full bg-halo animate-pulse" />
      <span className="font-serif text-sm">
        {variant === 'admin' ? (
          <>
            Nouveau scan · {visible.influencerName} · −{visible.discountPercent}% · {formatFCFA(visible.rewardXof)}
          </>
        ) : (
          <>
            Nouveau scan · {visible.restaurantName} · +{formatFCFA(visible.rewardXof)}
          </>
        )}
      </span>
    </div>
  );
}
