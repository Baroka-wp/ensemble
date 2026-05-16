import type { ReactNode } from 'react';
import { BrandHeader } from '../../components/BrandHeader';
import { PublicCard, PublicPageLayout } from '../../components/PublicPageLayout';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PublicPageLayout>
      <div className="w-full max-w-md">
        <BrandHeader className="mb-8 md:mb-10" />
        <PublicCard>
          <h1 className="font-sans font-thin text-3xl md:text-4xl tracking-wider2 text-espresso">{title}</h1>
          {subtitle && <p className="font-serif text-warmgray mt-2 text-sm md:text-base">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-8 pt-6 border-t border-sand/60 text-sm text-warmgray font-serif">{footer}</div>
          )}
        </PublicCard>
      </div>
    </PublicPageLayout>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block mb-5">
      <span className="block text-xs uppercase tracking-wider2 text-warmgray mb-2">{label}</span>
      {children}
      {hint && <span className="block text-xs text-warmgray/80 mt-1.5 font-serif">{hint}</span>}
    </label>
  );
}

export function TextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full px-4 py-3 bg-cream/50 border border-sand rounded-lg text-espresso placeholder:text-warmgray/60 focus:outline-none focus:border-orange/50 focus:ring-2 focus:ring-orange/15 transition-colors font-serif',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full px-6 py-3.5 bg-orange text-cream rounded-full text-xs tracking-wider2 uppercase font-medium hover:bg-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-orange/25"
    />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 px-4 py-3 bg-halo/30 border border-halo/80 rounded-lg text-sm text-espresso font-serif">
      {message}
    </div>
  );
}
