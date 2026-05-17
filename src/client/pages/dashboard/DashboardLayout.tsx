import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { apiFetch } from '../../lib/api';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { IconActivity, IconHome, IconQr, IconStar, IconUsers } from '../../components/dashboard/icons';
import type { CollaborationStatus } from '../../../shared/schemas/collaboration';

const ICON_CLASS = 'h-[18px] w-[18px]';

export function DashboardLayout() {
  const { restaurant, logout } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['admin', 'collaborations', 'counts'],
    queryFn: () =>
      apiFetch<{ counts: Record<CollaborationStatus, number> }>('/admin/collaborations/counts', {
        auth: true,
      }),
    enabled: Boolean(restaurant),
    refetchInterval: 30_000,
  });
  const pendingCount = data?.counts.pending ?? 0;

  if (!restaurant) return null;

  const navItems = [
    { to: '/dashboard', label: 'Accueil', icon: <IconHome className={ICON_CLASS} />, end: true },
    {
      to: '/dashboard/collaborations',
      label: 'Collaborations',
      icon: <IconUsers className={ICON_CLASS} />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { to: '/dashboard/scans', label: 'Scans', icon: <IconActivity className={ICON_CLASS} /> },
    { to: '/dashboard/avis', label: 'Avis', icon: <IconStar className={ICON_CLASS} /> },
    { to: '/dashboard/qr', label: 'QR salle', icon: <IconQr className={ICON_CLASS} /> },
  ];

  return (
    <DashboardShell
      variant="restaurant"
      navItems={navItems}
      footer={<p className="truncate text-cream/55 text-xs">{restaurant.name}</p>}
      onLogout={() => {
        logout();
        navigate('/login', { replace: true });
      }}
    >
      <Outlet />
    </DashboardShell>
  );
}
