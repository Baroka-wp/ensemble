import { LandingNav } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { SocialProofBar } from '../components/landing/SocialProofBar';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PromisesSection } from '../components/landing/PromisesSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CtaBand } from '../components/landing/CtaBand';
import { LandingFooter } from '../components/landing/LandingFooter';

export function HomePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-cream text-espresso">
      <LandingNav />
      <main>
        <HeroSection />
        <SocialProofBar />
        <HowItWorks />
        <PromisesSection />
        <TestimonialsSection />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}
