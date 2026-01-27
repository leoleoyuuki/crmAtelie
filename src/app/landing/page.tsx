'use client';

import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { MobileAccessSection } from '@/components/landing/mobile-access-section';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { TutorialsSection } from '@/components/landing/tutorials-section';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <div id="recursos">
         <FeatureHighlights />
        </div>
        <MobileAccessSection />
        <TutorialsSection />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
