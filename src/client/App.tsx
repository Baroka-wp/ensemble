import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { EnsembleLogo } from './components/EnsembleLogo';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { InfluencersListPage } from './pages/dashboard/influencers/InfluencersListPage';
import { InfluencerNewPage } from './pages/dashboard/influencers/InfluencerNewPage';
import { InfluencerEditPage } from './pages/dashboard/influencers/InfluencerEditPage';
import { ScansPage } from './pages/dashboard/ScansPage';
import { QrPage } from './pages/dashboard/QrPage';
import { ScanPage } from './pages/public/ScanPage';
import { InfluencerLoginPage } from './pages/public/InfluencerLoginPage';
import { InfluencerDashboardLayout } from './pages/public/InfluencerDashboardLayout';
import { InfluencerCodePage } from './pages/public/influencer/InfluencerCodePage';
import { InfluencerStatsPage } from './pages/public/influencer/InfluencerStatsPage';
import { InfluencerScansPage } from './pages/public/influencer/InfluencerScansPage';
import { AuthGuard } from './lib/auth';
import { InfluencerAuthGuard } from './lib/influencerAuth';

function Placeholder({ title }: { title: string }) {
  return (
    <section className="text-center py-16">
      <p className="uppercase tracking-wider2 text-warmgray text-xs mb-4">À venir</p>
      <h1 className="font-sans font-thin text-3xl tracking-wider2 mb-3">{title}</h1>
      <p className="font-serif text-warmgray">Cet écran sera construit dans un sprint ultérieur.</p>
    </section>
  );
}

function PublicPlaceholder({ title }: { title: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex justify-center">
        <EnsembleLogo />
      </div>
      <h1 className="font-sans font-thin text-4xl md:text-5xl tracking-wider2 mb-3">{title}</h1>
      <Link to="/" className="mt-10 text-sm underline-offset-4 underline text-deepspace/70 hover:text-deepspace">
        Accueil
      </Link>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="influencers" element={<InfluencersListPage />} />
        <Route path="influencers/new" element={<InfluencerNewPage />} />
        <Route path="influencers/:id" element={<InfluencerEditPage />} />
        <Route path="scans" element={<ScansPage />} />
        <Route path="qr" element={<QrPage />} />
      </Route>

      <Route path="/s/:slug" element={<ScanPage />} />

      <Route path="/i/login" element={<InfluencerLoginPage />} />
      <Route
        path="/i"
        element={
          <InfluencerAuthGuard>
            <InfluencerDashboardLayout />
          </InfluencerAuthGuard>
        }
      >
        <Route index element={<Navigate to="/i/code" replace />} />
        <Route path="code" element={<InfluencerCodePage />} />
        <Route path="stats" element={<InfluencerStatsPage />} />
        <Route path="scans" element={<InfluencerScansPage />} />
      </Route>

      <Route path="*" element={<PublicPlaceholder title="Page introuvable" />} />
    </Routes>
  );
}
