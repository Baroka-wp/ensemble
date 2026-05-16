import type { CollaborationStatus } from '../../shared/schemas/collaboration';

const LABELS: Record<CollaborationStatus, string> = {
  pending: 'En attente',
  active: 'Active',
  rejected: 'Refusée',
  paused_by_inf: 'En pause (vous)',
  paused_by_resto: 'En pause (resto)',
};

const STYLES: Record<CollaborationStatus, string> = {
  pending: 'bg-halo/30 text-espresso border-halo/60',
  active: 'bg-sage/15 text-sage border-sage/40',
  rejected: 'bg-wine/10 text-wine border-wine/40',
  paused_by_inf: 'bg-sand/40 text-espresso border-sand',
  paused_by_resto: 'bg-sand/40 text-espresso border-sand',
};

export function CollaborationStatusBadge({
  status,
  perspective = 'influencer',
}: {
  status: CollaborationStatus;
  perspective?: 'influencer' | 'restaurant';
}) {
  let label = LABELS[status];
  // Du point de vue restaurant, l'étiquette de pause s'inverse.
  if (perspective === 'restaurant') {
    if (status === 'paused_by_inf') label = 'En pause (influenceur)';
    if (status === 'paused_by_resto') label = 'En pause (vous)';
  }
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider2 px-2 py-1 rounded-full border',
        STYLES[status],
      ].join(' ')}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
