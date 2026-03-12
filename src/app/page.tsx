import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Templates from "@/components/sections/Templates";
import CTA from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Templates />
      <CTA />
      <Footer />
    </main>
  );
}
