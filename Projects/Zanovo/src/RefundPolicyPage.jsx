import { useEffect } from "react";
import { Link } from "react-router-dom";

const C = {
  bg: "#0A0D12",
  border: "rgba(255,255,255,0.08)",
  accent: "#FF6B00",
  text: "#F9FAFB",
  muted: "#9CA3AF",
};

function Logo({ size = 28 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={Math.round(size * 0.73)} viewBox="0 0 120 87" fill="none" aria-hidden>
        <defs>
          <linearGradient id="rp-lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9A3C" />
          </linearGradient>
          <linearGradient id="rp-lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CC4A00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
        <polygon points="0,0 28,0 60,87 44,87" fill="url(#rp-lg1)" />
        <polygon points="120,0 92,0 60,87 76,87" fill="url(#rp-lg2)" />
      </svg>
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: size, color: C.text, letterSpacing: "-0.03em" }}>
        Zanovo
      </span>
    </div>
  );
}

const sectionTitle = {
  fontFamily: "system-ui, sans-serif",
  fontSize: "1.05rem",
  fontWeight: 700,
  color: C.text,
  marginTop: 32,
  marginBottom: 12,
};

const body = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 15,
  lineHeight: 1.75,
  color: C.muted,
  margin: "0 0 12px",
};

const list = {
  ...body,
  paddingLeft: 22,
  marginBottom: 16,
};

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = "Refund & Cancellation Policy | Zanovo";
    return () => { document.title = "Web Design & AI Systems South Africa | Zanovo"; };
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100svh", color: C.text }}>
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }} aria-label="Zanovo home">
          <Logo size={24} />
        </Link>
        <Link
          to="/"
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: C.accent,
            textDecoration: "none",
          }}
        >
          ← Back to site
        </Link>
      </header>

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 12px" }}>
          Refund &amp; cancellation policy
        </h1>
        <p style={{ ...body, fontSize: 13, marginBottom: 4 }}>
          <strong style={{ color: C.text }}>Effective date:</strong> 11 May 2026
        </p>
        <p style={{ ...body, fontSize: 13, marginBottom: 20 }}>
          <strong style={{ color: C.text }}>Version:</strong> 1.1
        </p>

        <aside
          style={{
            padding: "16px 18px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: "rgba(255,255,255,0.03)",
            marginBottom: 28,
          }}
        >
          <p style={{ ...body, fontSize: 13, margin: 0, lineHeight: 1.65 }}>
            This policy sets out the terms under which Zanovo issues refunds and processes cancellations. It applies to all clients and is intended to be fair to both parties.{" "}
            <strong style={{ color: C.text }}>Please read it before making a payment.</strong>
          </p>
        </aside>

        <h2 style={sectionTitle}>1. Who we are</h2>
        <p style={body}>
          <strong style={{ color: C.text }}>Zanovo</strong> (referred to as "we", "us", or "our") is a South Africa-based digital growth agency providing web design, AI lead generation systems, and automation services to small businesses. Contact us at{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a> with any queries relating to this policy.
        </p>

        <h2 style={sectionTitle}>2. Scope</h2>
        <p style={body}>
          This policy applies to all payments made to Zanovo, including setup fees, monthly retainers, and project-based work. By making a payment, you acknowledge and agree to the terms described here.
        </p>

        <h2 style={sectionTitle}>3. Definitions</h2>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Setup fee:</strong> A once-off payment made upfront to begin a project or onboard onto a service package.</li>
          <li><strong style={{ color: C.text }}>Monthly retainer:</strong> A recurring payment made each month for ongoing services (hosting, maintenance, AI systems, etc.).</li>
          <li><strong style={{ color: C.text }}>Project work:</strong> Any custom website build, AI system build, or bespoke development engagement.</li>
          <li><strong style={{ color: C.text }}>Acceptance:</strong> The point at which the client confirms the delivered work meets the agreed scope, either in writing or by deploying it in production.</li>
          <li><strong style={{ color: C.text }}>Defective service:</strong> A delivered service that materially fails to meet the agreed specification, through no fault of the client.</li>
        </ul>

        <h2 style={sectionTitle}>4. Quick reference — refund and cancellation summary</h2>
        <p style={body}>The table below summarises the key rules for each service type. Full details follow in the sections below.</p>

        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "system-ui, sans-serif",
            fontSize: 13,
          }}>
            <thead>
              <tr>
                {["Service", "Refund / Cancellation", "Key conditions"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: `1px solid ${C.border}`,
                    color: C.text, fontWeight: 700,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Website / project work", "Full refund before work starts; 75% within 3 days; 10% per day deducted thereafter", "No refund once deposit is offset by work done; no refund after client acceptance"],
                ["Monthly retainer", "No refund; access continues until end of the paid month", "Cancel in writing; final month is non-refundable"],
                ["Setup fee", "Non-refundable once delivered", "Refundable only if Zanovo fails to complete the agreed deliverables"],
                ["Defective service", "Full or partial refund if raised within 1 month of delivery", "Must be raised in writing within one month"],
              ].map(([service, refund, conditions], i) => (
                <tr key={i}>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.text, fontWeight: 600, verticalAlign: "top" }}>{service}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted, verticalAlign: "top" }}>{refund}</td>
                  <td style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, color: C.muted, verticalAlign: "top" }}>{conditions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={sectionTitle}>5. Website and project work</h2>
        <p style={body}>
          For custom website builds, AI system builds, and other project-based work, the following refund schedule applies from the date the client pays the deposit and Zanovo begins work:
        </p>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Before work starts:</strong> Full refund of the setup fee or deposit, less any payment processing fees.</li>
          <li><strong style={{ color: C.text }}>Within 3 calendar days of work starting:</strong> 75% refund of the amount paid.</li>
          <li><strong style={{ color: C.text }}>After 3 days:</strong> The refund is reduced by 10% of the total project fee for each additional calendar day elapsed.</li>
          <li><strong style={{ color: C.text }}>Once the deposit is fully offset by work completed:</strong> No further refund is available.</li>
          <li><strong style={{ color: C.text }}>After client acceptance:</strong> No refund is available once you have accepted the delivered work (whether in writing or by deploying it in production).</li>
        </ul>
        <p style={body}>
          "Work starting" means the moment Zanovo begins any substantive activity on your project — including the planning call, design, development, or configuration of your systems.
        </p>

        <h2 style={sectionTitle}>6. Monthly retainer</h2>
        <p style={body}>
          Monthly retainer fees are non-refundable. If you cancel your retainer, your services and access will remain active until the end of the calendar month for which payment was made. No partial refunds are issued for unused days within a paid month.
        </p>
        <p style={body}>
          Cancellations must be submitted in writing to{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>.
          {" "}The final month's fee is non-refundable under any circumstances. Cancellations take effect at the end of the month in which written notice is received.
        </p>

        <h2 style={sectionTitle}>7. Setup fee</h2>
        <p style={body}>
          The setup fee is non-refundable once Zanovo has delivered the agreed service or deliverable. The setup fee is only refundable if Zanovo fails to complete the agreed scope of work. In that event, a full refund of the setup fee will be issued within 10 business days of the failure being acknowledged.
        </p>
        <p style={body}>
          For clarity: making a payment and receiving a planning call constitutes the beginning of delivery. The setup fee is not refundable solely because you change your mind after the planning process has commenced.
        </p>

        <h2 style={sectionTitle}>8. Defective service</h2>
        <p style={body}>
          If a delivered service materially fails to meet the agreed specification — through no fault of the client — you are entitled to raise this in writing within <strong style={{ color: C.text }}>one month of delivery</strong>. Depending on the nature and severity of the defect, Zanovo will either:
        </p>
        <ul style={list}>
          <li>Rectify the defect at no additional cost; or</li>
          <li>Issue a full or partial refund, at our reasonable discretion.</li>
        </ul>
        <p style={body}>
          Defect claims raised after one month from delivery will not be eligible for a refund. This does not affect your rights under applicable South African consumer protection law.
        </p>

        <h2 style={sectionTitle}>9. How to request a refund or cancellation</h2>
        <p style={body}>
          All refund and cancellation requests must be made in writing. To initiate a request:
        </p>
        <ul style={list}>
          <li>Email <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a> with the subject line: <em style={{ color: C.text }}>"Refund Request – [Your Business Name]"</em> or <em style={{ color: C.text }}>"Cancellation – [Your Business Name]"</em>.</li>
          <li>Include your full name, business name, the service in question, and the reason for your request.</li>
          <li>We will acknowledge your request within one business day and aim to resolve it within 5–10 business days.</li>
        </ul>

        <h2 style={sectionTitle}>10. Refund method</h2>
        <p style={body}>
          Approved refunds will be issued via EFT to the South African bank account from which the original payment was made, or to an alternative account you specify. Zanovo does not issue refunds to third-party accounts unless explicitly agreed in writing. Processing times may vary depending on your bank (typically 1–3 business days after Zanovo initiates the payment).
        </p>

        <h2 style={sectionTitle}>11. Consumer Protection Act (South Africa)</h2>
        <p style={body}>
          Nothing in this policy is intended to limit or exclude rights you hold under the South African Consumer Protection Act, 2008 ("CPA"), where those rights apply. If there is any conflict between this policy and your rights under the CPA, your statutory rights take precedence.
        </p>

        <h2 style={sectionTitle}>12. Changes to this policy</h2>
        <p style={body}>
          Zanovo may update this policy from time to time. The effective date at the top of this page will reflect the most recent revision. Changes will not apply retroactively to payments already made under a prior version of this policy.
        </p>

        <h2 style={sectionTitle}>Contact</h2>
        <p style={{ ...body, marginBottom: 0 }}>
          Questions about this policy:{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>
          <br />
          Zanovo — South Africa
        </p>
      </article>
    </div>
  );
}
