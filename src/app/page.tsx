import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { CareerDNASection } from "@/components/career-dna/CareerDNASection";
import { GSAPBentoShowcase } from "@/components/animations/GSAPBentoShowcase";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { InternshipSpotlight } from "@/components/landing/InternshipSpotlight";
import { CommunityShowcase } from "@/components/landing/CommunityShowcase";
import { CareerDevSection } from "@/components/landing/CareerDevSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <CareerDNASection />
        <GSAPBentoShowcase />
        <FeaturesGrid />
        <InternshipSpotlight />
        <CommunityShowcase />
        <CareerDevSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
