import { formatFCFA } from '../../../shared/schemas/influencer';

export function StatCard({
  label,
  scans,
  earnings,
  highlight,
}: {
  label: string;
  scans: number;
  earnings: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-xl p-4 border transition-shadow',
        highlight
          ? 'bg-gradient-to-br from-terracotta to-wine text-cream border-transparent shadow-md shadow-terracotta/20'
          : 'bg-white/90 border-sand/80 shadow-sm shadow-espresso/5',
      ].join(' ')}
    >
      <p className={['text-[10px] uppercase tracking-wider2', highlight ? 'text-cream/75' : 'text-warmgray'].join(' ')}>
        {label}
      </p>
      <p className={['font-sans text-2xl font-light mt-1 tabular-nums', highlight ? 'text-cream' : 'text-espresso'].join(' ')}>
        {formatFCFA(earnings)}
      </p>
      <p className={['text-xs mt-1 tabular-nums', highlight ? 'text-cream/70' : 'text-sage'].join(' ')}>
        {scans} scan{scans > 1 ? 's' : ''}
      </p>
    </div>
  );
}
