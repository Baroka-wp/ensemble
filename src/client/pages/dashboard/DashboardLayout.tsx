import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { IconActivity, IconHome, IconQr, IconUsers } from '../../components/dashboard/icons';

const RESTAURANT_NAV = [
  { to: '/dashboard', label: 'Accueil', icon: <IconHome className="h-[18px] w-[18px]" />, end: true },
  { to: '/dashboard/influencers', label: 'Influenceurs', icon: <IconUsers className="h-[18px] w-[18px]" /> },
  { to: '/dashboard/scans', label: 'Scans', icon: <IconActivity className="h-[18px] w-[18px]" /> },
  { to: '/dashboard/qr', label: 'QR salle', icon: <IconQr className="h-[18px] w-[18px]" /> },
];

export function DashboardLayout() {
  const { restaurant, logout } = useAuth();
  const navigate = useNavigate();
  if (!restaurant) return null;

  return (
    <DashboardShell
      variant="restaurant"
      navItems={RESTAURANT_NAV}
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
