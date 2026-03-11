'use client';

import { Header } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeatureHighlights } from '@/components/landing/feature-highlights';
import { AllFeatures } from '@/components/landing/all-features';
import { MobileAccessSection } from '@/components/landing/mobile-access-section';
import { Cta } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';
import { FaqSection } from '@/components/landing/faq-section';
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Lightweight Background Design */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 bg-noise mix-blend-soft-light" />
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--secondary)/0.05)_0%,transparent_50%)]" />

      <div className="relative z-10 w-full">
        <Header />
        <main className="w-full">
          <HeroSection />
          <div id="recursos" className="w-full">
            <FeatureHighlights />
          </div>
          <AllFeatures />
          <StaggerTestimonials />
          <MobileAccessSection />
          <FaqSection />
          <Cta />
        </main>
        <Footer />
      </div>
    </div>
  );
}