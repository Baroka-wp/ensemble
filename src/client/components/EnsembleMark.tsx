/**
 * Monogramme « ensemble » — trois nœuds reliés (restaurant · influenceur · client).
 * Trait fin, lisible dès 14px, hérite de currentColor.
 */
export function EnsembleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="10" cy="4.25" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4.75" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="15.25" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M10 6.45 5.9 12.1M10 6.45l4.1 5.65M5.9 12.1h8.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
