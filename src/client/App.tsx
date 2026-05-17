import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { EnsembleLogo } from './components/EnsembleLogo';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { CollaborationsListPage } from './pages/dashboard/collaborations/CollaborationsListPage';
import { CollaborationQuickCreatePage } from './pages/dashboard/collaborations/CollaborationQuickCreatePage';
import { CollaborationEditPage } from './pages/dashboard/collaborations/CollaborationEditPage';
import { ScansPage } from './pages/dashboard/ScansPage';
import { ReviewsPage } from './pages/dashboard/ReviewsPage';
import { QrPage } from './pages/dashboard/QrPage';
import { ScanPage } from './pages/public/ScanPage';
import { ReviewFormPage } from './pages/public/ReviewFormPage';
import { ReviewShortcutPage } from './pages/public/ReviewShortcutPage';
import { FreeReviewPage } from './pages/public/FreeReviewPage';
import { RestaurantsDirectoryPage } from './pages/public/restaurants/RestaurantsDirectoryPage';
import { RestaurantDetailsPage } from './pages/public/restaurants/RestaurantDetailsPage';
import { ChooseSpacePage } from './pages/public/ChooseSpacePage';
import { InfluencerLoginPage } from './pages/public/InfluencerLoginPage';
import { InfluencerRegisterPage } from './pages/public/InfluencerRegisterPage';
import { InfluencerDashboardLayout } from './pages/public/InfluencerDashboardLayout';
import { InfluencerCollaborationsPage } from './pages/public/influencer/InfluencerCollaborationsPage';
import { InfluencerDiscoverPage } from './pages/public/influencer/InfluencerDiscoverPage';
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
      <Route path="/connexion" element={<ChooseSpacePage intent="login" />} />
      <Route path="/demarrer" element={<ChooseSpacePage intent="register" />} />
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
        <Route path="collaborations" element={<CollaborationsListPage />} />
        <Route path="collaborations/new" element={<CollaborationQuickCreatePage />} />
        <Route path="collaborations/:id" element={<CollaborationEditPage />} />
        <Route path="scans" element={<ScansPage />} />
        <Route path="avis" element={<ReviewsPage />} />
        <Route path="qr" element={<QrPage />} />
      </Route>

      <Route path="/s/:slug" element={<ScanPage />} />
      <Route path="/s/:slug/avis" element={<ReviewFormPage />} />
      <Route path="/s/:slug/avis-libre" element={<FreeReviewPage />} />
      <Route path="/a/:ticketCode" element={<ReviewShortcutPage />} />

      <Route path="/restaurants" element={<RestaurantsDirectoryPage />} />
      <Route path="/restaurants/:slug" element={<RestaurantDetailsPage />} />

      <Route path="/i/login" element={<InfluencerLoginPage />} />
      <Route path="/i/register" element={<InfluencerRegisterPage />} />
      <Route
        path="/i"
        element={
          <InfluencerAuthGuard>
            <InfluencerDashboardLayout />
          </InfluencerAuthGuard>
        }
      >
        <Route index element={<Navigate to="/i/collaborations" replace />} />
        <Route path="collaborations" element={<InfluencerCollaborationsPage />} />
        <Route path="discover" element={<InfluencerDiscoverPage />} />
        <Route path="stats" element={<InfluencerStatsPage />} />
        <Route path="scans" element={<InfluencerScansPage />} />
      </Route>

      <Route path="*" element={<PublicPlaceholder title="Page introuvable" />} />
    </Routes>
  );
}
