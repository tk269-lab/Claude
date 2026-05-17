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
          <linearGradient id="pp-lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9A3C" />
          </linearGradient>
          <linearGradient id="pp-lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CC4A00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
        <polygon points="0,0 28,0 60,87 44,87" fill="url(#pp-lg1)" />
        <polygon points="120,0 92,0 60,87 76,87" fill="url(#pp-lg2)" />
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

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | Zanovo";
    return () => { document.title = "Web Design Cape Town | Zanovo | AI-Powered Systems"; };
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
          Privacy policy
        </h1>
        <p style={{ ...body, fontSize: 13, marginBottom: 20 }}>
          <strong style={{ color: C.text }}>Last updated:</strong> 10 May 2026
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
            This policy explains how Zanovo collects and uses personal information. It is intended to support compliance with the South African Protection of Personal Information Act, 2013 (“POPIA”) and, where applicable, the EU and UK General Data Protection Regulation and similar laws.{" "}
            <strong style={{ color: C.text }}>It is not legal advice.</strong> Laws change, and your situation may require a qualified attorney or privacy professional.
          </p>
        </aside>

        <h2 style={sectionTitle}>1. Who we are</h2>
        <p style={body}>
          <strong style={{ color: C.text }}>Zanovo</strong> (referred to as “we”, “us”, or “our”) provides digital growth services for businesses. We are based in South Africa (Cape Town). For the purposes of POPIA, we act as the <strong style={{ color: C.text }}>responsible party</strong> in relation to personal information described in this policy. Where the GDPR or UK GDPR applies, we act as the <strong style={{ color: C.text }}>controller</strong> for the same processing.
        </p>
        <p style={body}>
          <strong style={{ color: C.text }}>Privacy and POPIA contact:</strong>{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>
        </p>
        <p style={body}>
          We have not appointed a Data Protection Officer under Article 37 GDPR, as we are not currently required to do so. EU and UK representatives are not appointed; if you are in the EEA or UK and wish to exercise rights, contact us at the email above.
        </p>

        <h2 style={sectionTitle}>2. Scope</h2>
        <p style={body}>
          This policy applies to personal information we process through our website (including enquiry and contact forms), email, and related communications when you engage with us as a prospective or current client. It does not cover our clients’ own customer databases or websites we host or build on their behalf, except where we process personal information strictly as instructed by a client (typically as an operator or processor).
        </p>

        <h2 style={sectionTitle}>3. Personal information we collect</h2>
        <p style={body}>Depending on how you interact with us, we may collect:</p>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Identity and contact details:</strong> name, business name, email address, telephone number.</li>
          <li><strong style={{ color: C.text }}>Enquiry content:</strong> information you voluntarily provide in messages (for example, your goals, challenges, or website URLs).</li>
          <li><strong style={{ color: C.text }}>Technical data:</strong> basic server and connection information that browsers and hosting infrastructure typically generate (such as IP address, approximate location derived from IP, user agent, and timestamps). We do not use invasive tracking pixels for advertising as part of this policy’s baseline description; if we add analytics or marketing pixels, we will update this policy and, where required, seek consent.</li>
        </ul>

        <h2 style={sectionTitle}>4. How and why we use personal information</h2>
        <p style={body}>We process personal information only for defined purposes, including:</p>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Responding to enquiries and arranging calls</strong> — to communicate with you about our services and follow up on your request.</li>
          <li><strong style={{ color: C.text }}>Contractual steps and performance</strong> — if you become a client, to deliver, invoice, and administer the engagement.</li>
          <li><strong style={{ color: C.text }}>Legal and compliance</strong> — where required by applicable law, regulation, court order, or to establish, exercise, or defend legal claims.</li>
          <li><strong style={{ color: C.text }}>Security and abuse prevention</strong> — to protect our systems, detect fraud or misuse, and maintain service integrity.</li>
        </ul>
        <p style={body}>
          <strong style={{ color: C.text }}>South Africa (POPIA):</strong> We rely on grounds in section 11 of POPIA where applicable, including consent where we ask for it, processing necessary to perform a contract with you or take steps at your request before a contract, compliance with legal obligations, protection of legitimate interests (ours or yours) where permitted, and other lawful bases recognised under POPIA.
        </p>
        <p style={body}>
          <strong style={{ color: C.text }}>EEA, UK, and similar jurisdictions:</strong> Our legal bases under the GDPR / UK GDPR may include consent (Article 6(1)(a)), performance of a contract (Article 6(1)(b)), legal obligation (Article 6(1)(c)), and legitimate interests (Article 6(1)(f)) such as responding to business enquiries and securing our services, balanced against your rights.
        </p>

        <h2 style={sectionTitle}>5. Cookies and similar technologies</h2>
        <p style={body}>
          Our site may use cookies or local storage that are strictly necessary for basic operation (for example, load balancing or session integrity). If we deploy non-essential cookies (analytics, marketing), we will describe them here and, where the law requires, obtain your consent before they run. You can control cookies through your browser settings.
        </p>

        <h2 style={sectionTitle}>6. Disclosure, subprocessors, and international transfers</h2>
        <p style={body}>
          We use reputable service providers to operate our business. These may include <strong style={{ color: C.text }}>cloud hosting and database providers</strong> (for example, to store enquiry data), <strong style={{ color: C.text }}>email and transactional messaging providers</strong> (for example, to deliver notifications relating to your enquiry), and <strong style={{ color: C.text }}>infrastructure vendors</strong> that process data incident to hosting. They process personal information on our instructions and under contractual terms that require confidentiality and appropriate security.
        </p>
        <p style={body}>
          Some providers may store or process data in countries outside South Africa, including the European Economic Area, the United Kingdom, the United States, or other regions. Where POPIA applies, we take steps required for lawful cross-border transfers (including, where appropriate, your consent or adequacy / appropriate safeguards). Where the GDPR or UK GDPR applies and data is transferred outside the EEA or UK, we rely on mechanisms such as adequacy decisions, standard contractual clauses approved by relevant authorities, or other lawful transfer tools, together with supplementary measures where required by case law and regulatory guidance.
        </p>
        <p style={body}>
          We may disclose information if required by law, legal process, or to protect the rights, safety, or property of Zanovo, our users, or others. We do not sell your personal information as “sale” is commonly understood in consumer privacy laws.
        </p>

        <h2 style={sectionTitle}>7. Retention</h2>
        <p style={body}>
          We keep personal information only as long as needed for the purposes above, including statutory, accounting, or dispute-resolution periods. Enquiry records are typically retained for a limited period unless you become a client (in which case client-file retention applies) or unless a longer period is required by law. When retention ends, we delete or irreversibly anonymise data where feasible.
        </p>

        <h2 style={sectionTitle}>8. Security</h2>
        <p style={body}>
          We implement reasonable technical and organisational measures appropriate to the risk, including access controls, encryption in transit where supported by our providers, and staff awareness. No online transmission or storage is completely secure; we cannot guarantee absolute security.
        </p>

        <h2 style={sectionTitle}>9. Your rights</h2>
        <p style={body}>
          <strong style={{ color: C.text }}>South Africa:</strong> Under POPIA you may have rights to request access to, correction or deletion of, and restriction or objection to certain processing of your personal information, subject to exceptions. You may also lodge a complaint with the Information Regulator (South Africa):{" "}
          <a href="https://www.inforegulator.org.za" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
            inforegulator.org.za
          </a>
          .
        </p>
        <p style={body}>
          <strong style={{ color: C.text }}>EEA and UK:</strong> Subject to applicable law, you may have rights of access, rectification, erasure, restriction, portability, objection, and withdrawal of consent where processing is consent-based. You may lodge a complaint with your local supervisory authority.
        </p>
        <p style={body}>
          <strong style={{ color: C.text }}>Other regions:</strong> If a jurisdiction grants you privacy rights, we will honour requests to the extent required by applicable law. Contact us at{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>{" "}
          to exercise rights. We may need to verify your identity before responding.
        </p>

        <h2 style={sectionTitle}>10. Children</h2>
        <p style={body}>
          Our services are directed at businesses and adults. We do not knowingly collect personal information from children under 18 (or the minimum age in your jurisdiction). If you believe we have collected such information, contact us and we will take appropriate steps to delete it.
        </p>

        <h2 style={sectionTitle}>11. Automated decision-making</h2>
        <p style={body}>
          We do not use solely automated decision-making, including profiling, that produces legal or similarly significant effects concerning you in relation to the processing described in this policy.
        </p>

        <h2 style={sectionTitle}>12. Changes</h2>
        <p style={body}>
          We may update this policy to reflect legal, technical, or business changes. The “Last updated” date will change, and for material changes we will provide additional notice where appropriate (for example, a banner on our site or an email if we communicate with you regularly).
        </p>

        <h2 style={sectionTitle}>13. Contact</h2>
        <p style={{ ...body, marginBottom: 0 }}>
          Questions about this policy or our privacy practices:{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>
          <br />
          Zanovo — Cape Town, South Africa
        </p>
      </article>
    </div>
  );
}
