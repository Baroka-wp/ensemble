import { useState } from 'react';
import { useAudience } from './AudienceContext';

const RESTAURANT_STATS = [
  { value: '< 30 s', label: 'pour qu’un client obtienne son ticket' },
  { value: '100 %', label: 'des scans tracés au bon influenceur' },
  { value: '1 QR', label: 'pour tous vos partenaires, à vie' },
] as const;

function formatFCFA(n: number) {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} FCFA`;
}

function InfluencerCalculator() {
  const [reward, setReward] = useState(500);
  const [scans, setScans] = useState(30);
  const total = reward * scans;
  return (
    <div className="rounded-3xl border border-orange/20 bg-white/80 p-6 sm:p-8 backdrop-blur-sm shadow-lg shadow-orange/5">
      <p className="text-[10px] uppercase tracking-[0.25em] text-orange mb-4">
        Simulez vos gains mensuels
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs uppercase tracking-wider2 text-warmgray">Gain par scan</span>
            <span className="font-mono text-sm text-espresso font-medium tabular-nums">
              {formatFCFA(reward)}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="w-full accent-orange"
            aria-label="Gain par scan en FCFA"
          />
          <div className="mt-1 flex justify-between text-[10px] text-warmgray/70 font-mono">
            <span>100</span>
            <span>3 000</span>
          </div>
        </label>

        <label className="block">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs uppercase tracking-wider2 text-warmgray">Scans / mois</span>
            <span className="font-mono text-sm text-espresso font-medium tabular-nums">
              {scans}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={scans}
            onChange={(e) => setScans(Number(e.target.value))}
            className="w-full accent-orange"
            aria-label="Nombre de scans par mois"
          />
          <div className="mt-1 flex justify-between text-[10px] text-warmgray/70 font-mono">
            <span>5</span>
            <span>200</span>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-col items-center gap-1 rounded-2xl bg-espresso/95 px-6 py-5 text-center sm:flex-row sm:justify-center sm:gap-3">
        <span className="text-[10px] uppercase tracking-wider2 text-cream/55">Vos gains estimés</span>
        <span className="font-sans font-thin text-3xl sm:text-4xl text-halo tabular-nums">
          {formatFCFA(total)}
        </span>
        <span className="text-[10px] uppercase tracking-wider2 text-cream/55">/ mois</span>
      </div>

      <p className="mt-4 text-center font-serif text-xs text-warmgray sm:text-[13px]">
        Versé par le restaurant à chaque scan validé en caisse.
      </p>
    </div>
  );
}

export function SocialProofBar() {
  const { audience } = useAudience();

  return (
    <section className="border-y border-sand/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 sm:py-14 md:px-8 md:py-16">
        {audience === 'restaurant' ? (
          <div key="resto" className="animate-[fadeIn_0.4s_ease-out]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-6">
              {RESTAURANT_STATS.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="font-sans text-3xl font-thin tracking-wide text-orange md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-serif text-sm leading-snug text-warmgray">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-[10px] uppercase tracking-[0.25em] text-warmgray sm:mt-12">
              Pensé pour la restauration indépendante d’Afrique de l’Ouest
            </p>
          </div>
        ) : (
          <div key="inf" className="animate-[fadeIn_0.4s_ease-out]">
            <InfluencerCalculator />
          </div>
        )}
      </div>
    </section>
  );
}
