
'use client';

import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { AllFeatures } from '@/components/landing/all-features';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <FeatureHighlights />
        <div id="recursos">
          <AllFeatures />
        </div>
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
