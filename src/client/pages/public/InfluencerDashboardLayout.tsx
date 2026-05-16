import { Outlet, useNavigate } from 'react-router-dom';
import { useInfluencerAuth } from '../../lib/influencerAuth';
import { InfluencerDashboardProvider, useInfluencerDashboard } from '../../lib/influencerDashboard';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { IconActivity, IconChart, IconTag } from '../../components/dashboard/icons';
import { LiveBadge } from '../../components/LiveScanToast';

const iconClass = 'h-[18px] w-[18px]';

function InfluencerShell() {
  const { influencer, logout } = useInfluencerAuth();
  const { connected } = useInfluencerDashboard();
  const navigate = useNavigate();

  if (!influencer) return null;

  return (
    <DashboardShell
      variant="influencer"
      headerExtra={<LiveBadge connected={connected} />}
      navItems={[
        { to: '/i/code', label: 'Mon code', icon: <IconTag className={iconClass} /> },
        { to: '/i/stats', label: 'Statistiques', icon: <IconChart className={iconClass} /> },
        { to: '/i/scans', label: 'Scans', icon: <IconActivity className={iconClass} /> },
      ]}
      footer={
        <div className="space-y-1">
          <p className="truncate font-medium text-cream/90">{influencer.displayName}</p>
          <p className="truncate text-[11px] text-cream/45">{influencer.restaurantName}</p>
        </div>
      }
      onLogout={() => {
        logout();
        navigate('/i/login', { replace: true });
      }}
    >
      <Outlet />
    </DashboardShell>
  );
}

export function InfluencerDashboardLayout() {
  return (
    <InfluencerDashboardProvider>
      <InfluencerShell />
    </InfluencerDashboardProvider>
  );
}
