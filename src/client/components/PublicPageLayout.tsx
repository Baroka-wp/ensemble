import type { ReactNode } from 'react';

export function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-linen via-cream to-mica overflow-hidden">
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-orange/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 md:px-8 md:py-14">
          {children}
        </div>
      </div>
    </main>
  );
}

export function PublicCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        'w-full rounded-2xl border border-sand/90 bg-white/95 p-8 shadow-lg shadow-espresso/5 md:p-10',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
