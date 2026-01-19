'use client';

import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <div id="recursos">
         <FeatureHighlights />
        </div>
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
