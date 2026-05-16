import { useAudience, type Audience } from './AudienceContext';

const TABS: { value: Audience; label: string; sub: string }[] = [
  { value: 'restaurant', label: 'Restaurant', sub: 'Je veux remplir ma salle' },
  { value: 'influencer', label: 'Influenceur', sub: 'Je veux monétiser mon audience' },
];

export function AudienceSwitcher() {
  const { audience, setAudience } = useAudience();
  return (
    <div
      role="tablist"
      aria-label="Je suis…"
      className="inline-flex rounded-full bg-espresso/5 p-1 border border-espresso/10 backdrop-blur-sm"
    >
      {TABS.map((tab) => {
        const active = audience === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => setAudience(tab.value)}
            className={[
              'group inline-flex flex-col items-start gap-0.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full text-left transition-all duration-200',
              active
                ? 'bg-espresso text-cream shadow-md'
                : 'text-warmgray hover:text-espresso',
            ].join(' ')}
          >
            <span className="text-xs uppercase tracking-wider2 font-medium">{tab.label}</span>
            <span
              className={[
                'text-[10px] font-serif italic',
                active ? 'text-cream/70' : 'text-warmgray/70',
              ].join(' ')}
            >
              {tab.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
