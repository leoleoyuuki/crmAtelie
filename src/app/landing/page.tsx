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
    <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* ── Global Grid / Checkered Background ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Dark‑mode override for the grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <Header />
      <main className="w-full relative z-10">
        <HeroSection />
        {/* <div id="recursos" className="w-full">
          <FeatureHighlights />
        </div> */}
        <FaqSection />
        <StaggerTestimonials />
        <AllFeatures />
        <MobileAccessSection />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}