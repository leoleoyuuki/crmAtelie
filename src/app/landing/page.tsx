'use client';

import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { AllFeatures } from '@/components/landing/all-features';
import { MobileAccessSection } from '@/components/landing/mobile-access-section';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { SocialProof } from '@/components/landing/social-proof';
import { FaqSection } from '@/components/landing/faq-section';

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <div id="recursos">
         <FeatureHighlights />
        </div>
        <AllFeatures />
        <SocialProof />
        <MobileAccessSection />
        <FaqSection />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
