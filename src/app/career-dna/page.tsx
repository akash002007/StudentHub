import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { CareerDNASection } from "@/components/career-dna/CareerDNASection";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Career DNA Intelligence Layer — StudentHub",
  description:
    "Your verified student career profile built from real evidence, technical repositories, coursework, and validated achievements.",
};

export default function CareerDNAPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingNav />
      <main className="flex-1 pt-14">
        <CareerDNASection />
      </main>
      <Footer />
    </div>
  );
}
