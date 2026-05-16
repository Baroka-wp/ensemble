import { generatePromoCode, normalizePromoCode } from '../../shared/promoCode';

type PromoCodeFieldProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function PromoCodeField({ value, onChange, disabled }: PromoCodeFieldProps) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(normalizePromoCode(e.target.value))}
        placeholder="MARIE7K"
        maxLength={12}
        autoComplete="off"
        spellCheck={false}
        className="flex-1 min-w-0 px-4 py-3 bg-white border border-sand/80 rounded-lg text-espresso font-mono tracking-wider uppercase focus:outline-none focus:border-orange/50 transition-colors disabled:opacity-50"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(generatePromoCode())}
        className="shrink-0 px-4 py-3 rounded-lg border border-orange/40 text-orange text-xs uppercase tracking-wider2 hover:bg-orange/10 transition-colors whitespace-nowrap disabled:opacity-50"
      >
        Aléatoire
      </button>
    </div>
  );
}
