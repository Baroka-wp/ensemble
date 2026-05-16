import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { EnsembleLogo } from '../EnsembleLogo';
import { usePageTitle } from './usePageTitle';
import { IconLogOut, IconMenu } from './icons';

export type DashboardNavItem = {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  /** Petit compteur affiché à droite (ex. nb de demandes en attente). Caché si 0 ou undefined. */
  badge?: number;
};

type DashboardShellProps = {
  variant: 'restaurant' | 'influencer';
  navItems: DashboardNavItem[];
  footer?: ReactNode;
  headerExtra?: ReactNode;
  onLogout: () => void;
  children: ReactNode;
};

export function DashboardShell({
  variant,
  navItems,
  footer,
  headerExtra,
  onLogout,
  children,
}: DashboardShellProps) {
  const pageTitle = usePageTitle(variant);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-linen via-cream to-mica">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-espresso text-cream/90 border-r border-black/10">
        <div className="px-5 py-5 border-b border-white/8">
          <EnsembleLogo
            to={variant === 'restaurant' ? '/dashboard' : '/i'}
            variant="light"
            markClassName="h-5 w-5"
          />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} onNavigate={() => setMobileOpen(false)} />
          ))}
        </nav>
        {footer && <div className="px-4 py-4 border-t border-white/8 text-sm">{footer}</div>}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-espresso/40 backdrop-blur-sm"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={[
          'md:hidden fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-espresso text-cream/90 shadow-2xl transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="px-5 py-5 border-b border-white/8 flex items-center justify-between">
          <EnsembleLogo
            to={variant === 'restaurant' ? '/dashboard' : '/i'}
            variant="light"
            markClassName="h-5 w-5"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-cream/60 hover:text-cream hover:bg-white/5"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} onNavigate={() => setMobileOpen(false)} />
          ))}
        </nav>
        {footer && <div className="px-4 py-4 border-t border-white/8 text-sm">{footer}</div>}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center gap-3 px-4 md:px-6 bg-cream/90 backdrop-blur border-b border-terracotta/15">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 -ml-1 rounded-lg text-warmgray hover:text-orange hover:bg-orange/10"
            aria-label="Menu"
          >
            <IconMenu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-medium text-espresso truncate min-w-0">{pageTitle}</h1>
          <div className="ml-auto flex items-center gap-1 shrink-0">
            {headerExtra}
            <button
              type="button"
              onClick={onLogout}
              aria-label="Déconnexion"
              title="Déconnexion"
              className="p-2.5 rounded-xl text-warmgray hover:text-orange hover:bg-orange/10 transition-colors"
            >
              <IconLogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  label,
  icon,
  end,
  badge,
  onNavigate,
}: DashboardNavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
          isActive
            ? 'bg-orange/30 text-cream font-medium'
            : 'text-cream/65 hover:text-cream hover:bg-white/8',
        ].join(' ')
      }
    >
      <span className="shrink-0 opacity-90 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
      <span className="truncate flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="shrink-0 inline-flex items-center justify-center text-[10px] min-w-[18px] px-1.5 py-0.5 rounded-full bg-orange text-cream font-medium">
          {badge}
        </span>
      )}
    </NavLink>
  );
}
