import { useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const RESTAURANT_TITLES: { path: string; title: string; end?: boolean }[] = [
  { path: '/dashboard/influencers/new', title: 'Nouvel influenceur' },
  { path: '/dashboard/influencers/:id', title: 'Influenceur' },
  { path: '/dashboard/influencers', title: 'Influenceurs' },
  { path: '/dashboard/scans', title: 'Scans' },
  { path: '/dashboard/qr', title: 'QR salle' },
  { path: '/dashboard', title: 'Accueil', end: true },
];

const INFLUENCER_TITLES: { path: string; title: string; end?: boolean }[] = [
  { path: '/i/code', title: 'Mon code promo', end: true },
  { path: '/i/stats', title: 'Statistiques', end: true },
  { path: '/i/scans', title: 'Derniers scans', end: true },
  { path: '/i', title: 'Mon code promo', end: true },
];

export function usePageTitle(variant: 'restaurant' | 'influencer') {
  const { pathname } = useLocation();
  const routes = variant === 'restaurant' ? RESTAURANT_TITLES : INFLUENCER_TITLES;

  return useMemo(() => {
    for (const route of routes) {
      if (matchPath({ path: route.path, end: route.end }, pathname)) {
        return route.title;
      }
    }
    return 'ensemble';
  }, [pathname, routes]);
}
