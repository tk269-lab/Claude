import { useEffect } from "react";
import { Navbar, Footer, PricingSection, CareSection } from "./App.jsx";

export default function PricingPage() {
  useEffect(() => {
    document.title = "Pricing & Plans | Zanovo";
    window.scrollTo(0, 0);
    return () => { document.title = "Web Design & AI Systems South Africa | Zanovo"; };
  }, []);

  return (
    <div style={{ background: "#0A0D12", minHeight: "100svh" }}>
      <Navbar />
      <main style={{ paddingTop: 24 }}>
        <PricingSection />
        <CareSection />
      </main>
      <Footer />
    </div>
  );
}
