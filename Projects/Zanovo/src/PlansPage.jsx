import { useEffect } from "react";
import { Navbar, Footer, PricingSection, CareSection } from "./App.jsx";

/* Shareable pricing link (zanovo.co.za/plans). Not linked from the site nav —
   TK sends this to a client directly, and they can pay from here. Kept out of
   search results so pricing stays a conversation, not a public page. */
export default function PlansPage() {
  useEffect(() => {
    document.title = "Your Plan & Pricing | Zanovo";
    window.scrollTo(0, 0);

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      document.title = "Web Design & AI Systems South Africa | Zanovo";
      meta.remove();
    };
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
