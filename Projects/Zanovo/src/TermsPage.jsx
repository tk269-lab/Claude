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
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <img src="/zanovo-submark-transparent.png" alt="Zanovo" height={size * 1.5} style={{ display: "block", marginRight: -6 }} />
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

const subTitle = {
  ...sectionTitle,
  fontSize: "0.92rem",
  marginTop: 20,
  marginBottom: 8,
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

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service | Zanovo";
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
          Terms of service
        </h1>
        <p style={{ ...body, fontSize: 13, marginBottom: 4 }}>
          <strong style={{ color: C.text }}>Effective date:</strong> 10 June 2026
        </p>
        <p style={{ ...body, fontSize: 13, marginBottom: 20 }}>
          <strong style={{ color: C.text }}>Version:</strong> 1.0
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
            These terms govern your use of the Zanovo website and our services. By using this website,
            creating an account, or purchasing a package, you agree to these terms.{" "}
            <strong style={{ color: C.text }}>Please read them together with our{" "}
              <Link to="/privacy" style={{ color: C.accent }}>Privacy Policy</Link> and{" "}
              <Link to="/refund" style={{ color: C.accent }}>Refund &amp; Cancellation Policy</Link>.
            </strong>
          </p>
        </aside>

        <h2 style={sectionTitle}>1. Who we are</h2>
        <p style={body}>
          This website, <strong style={{ color: C.text }}>zanovo.co.za</strong>, is owned and operated by{" "}
          <strong style={{ color: C.text }}>Zanovo (Pty) Ltd</strong> ("Zanovo", "we", "us", or "our"),
          a private company registered in the Republic of South Africa
          (registration number: 2026/420249/07), with its principal place of business in
          Cape Town, Western Cape, South Africa. Our full physical address is available on written request.
        </p>
        <p style={body}>
          The information in this section is provided in compliance with section 43 of the
          Electronic Communications and Transactions Act 25 of 2002 ("ECTA").
        </p>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Email:</strong>{" "}
            <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a></li>
          <li><strong style={{ color: C.text }}>Website:</strong> https://zanovo.co.za</li>
          <li><strong style={{ color: C.text }}>Services:</strong> web design and development, AI-powered
            lead generation and automation systems, and ongoing website management for small businesses</li>
        </ul>

        <h2 style={sectionTitle}>2. Acceptance of these terms</h2>
        <p style={body}>
          By accessing this website, submitting an enquiry, creating an account, or making a payment,
          you confirm that you have read, understood, and agree to be bound by these terms. If you are
          accepting on behalf of a business, you warrant that you are authorised to bind that business.
          If you do not agree with these terms, please do not use the website or our services.
        </p>

        <h2 style={sectionTitle}>3. Our services</h2>
        <p style={body}>
          Zanovo provides digital services to businesses, including website design and development,
          AI-powered lead capture and automation systems, ongoing care and maintenance plans, and
          related add-on services (such as copywriting, photography coordination, logo design, and
          social media setup). The scope of each engagement is set out in the package description at
          checkout, or in a custom proposal agreed with you before work begins.
        </p>
        <p style={body}>
          Every paid engagement begins with a planning call. No design or build work starts until that
          call has taken place and you have approved the direction.
        </p>

        <h2 style={sectionTitle}>4. Accounts</h2>
        <p style={body}>
          To purchase a package you must create an account with accurate, current information. You are
          responsible for keeping your password confidential and for all activity under your account.
          Notify us immediately at{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>{" "}
          if you suspect unauthorised use of your account. We may suspend or close accounts that
          provide false information or are used in breach of these terms.
        </p>

        <h2 style={sectionTitle}>5. Fees and payment</h2>
        <ul style={list}>
          <li>Package prices are displayed in South African Rand (ZAR) and consist of a once-off setup
            fee plus a monthly retainer that begins only after your website and systems go live, unless
            stated otherwise.</li>
          <li>Card payments are processed securely by Paystack. We never see or store your card details.
            EFT payments must use the reference provided at checkout.</li>
          <li>Monthly retainers and care plans are billed month-to-month. Either party may cancel with
            one calendar month's written notice, as set out in our{" "}
            <Link to="/refund" style={{ color: C.accent }}>Refund &amp; Cancellation Policy</Link>.</li>
          <li>We may adjust recurring fees with at least 30 days' written notice. Price changes never
            apply retroactively.</li>
          <li>If a recurring payment fails and remains unpaid after reasonable notice, we may suspend
            services (including hosting) until the account is settled.</li>
        </ul>

        <h2 style={sectionTitle}>6. Cooling-off and cancellations</h2>
        <p style={body}>
          Where section 44 of ECTA applies to an electronic transaction, you may cancel within seven (7)
          days of the transaction without reason or penalty, provided that services have not yet commenced
          with your agreement. Once the planning call has taken place and work has begun, cancellations are
          handled in terms of our{" "}
          <Link to="/refund" style={{ color: C.accent }}>Refund &amp; Cancellation Policy</Link>, which is
          designed to be consistent with the Consumer Protection Act 68 of 2008 ("CPA") where it applies.
        </p>

        <h2 style={sectionTitle}>7. Your obligations as a client</h2>
        <ul style={list}>
          <li>Provide the content, feedback, and approvals we reasonably need to deliver on time. Delivery
            timelines pause while we wait for required input from you.</li>
          <li>Ensure that all material you supply (text, images, logos, data) is accurate, lawful, and does
            not infringe any third party's rights. You retain ownership of everything you supply.</li>
          <li>Use our services and any systems we build only for lawful purposes, and in compliance with
            applicable law, including the CPA, POPIA, and electronic marketing rules.</li>
        </ul>

        <h2 style={sectionTitle}>8. Copyright and intellectual property</h2>
        <p style={body}>
          All copyright in and to this website and its content — including text, graphics, logos, the
          Zanovo name and mark, page designs, source code, and visual layouts — is owned by or licensed
          to Zanovo (Pty) Ltd and is protected under the Copyright Act 98 of 1978 and applicable
          international treaties. <strong style={{ color: C.text }}>© {new Date().getFullYear()} Zanovo (Pty) Ltd.
          All rights reserved.</strong>
        </p>

        <h3 style={subTitle}>8.1 What you may do</h3>
        <p style={body}>
          You may view, download, and print pages from this website for your own lawful, personal, or
          internal business use, provided all copyright notices remain intact.
        </p>

        <h3 style={subTitle}>8.2 What you may not do</h3>
        <ul style={list}>
          <li>Reproduce, republish, distribute, or commercially exploit website content without our prior
            written consent.</li>
          <li>Use the Zanovo name, logo, or branding in a way that suggests endorsement or affiliation
            without permission.</li>
          <li>Scrape, harvest, or systematically extract data or source code from this website.</li>
        </ul>

        <h3 style={subTitle}>8.3 Work we build for clients</h3>
        <ul style={list}>
          <li><strong style={{ color: C.text }}>Your content stays yours.</strong> Anything you supply to
            us remains your property.</li>
          <li><strong style={{ color: C.text }}>Deliverables transfer on full payment.</strong> Once the
            setup fee and any outstanding amounts are paid in full, ownership of the final, bespoke
            deliverables we create for you (your website design and its content) transfers to you.</li>
          <li><strong style={{ color: C.text }}>Our tooling remains ours.</strong> We retain ownership of
            our pre-existing materials, internal tools, frameworks, know-how, and reusable components,
            and grant you a perpetual licence to use them as embedded in your deliverables.</li>
          <li><strong style={{ color: C.text }}>Third-party components.</strong> Open-source software,
            fonts, stock assets, and platform services (e.g. hosting, payment, and AI providers) remain
            subject to their own licences, which we will pass on to you where applicable.</li>
          <li><strong style={{ color: C.text }}>Portfolio rights.</strong> We may display completed,
            publicly launched work in our portfolio and marketing, unless you ask us in writing not to.</li>
        </ul>

        <h3 style={subTitle}>8.4 Copyright complaints</h3>
        <p style={body}>
          If you believe content on this website infringes your copyright, notify us at{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>{" "}
          with details of the work and its location on our site, and we will investigate and respond
          within a reasonable time, in line with the take-down procedure contemplated in section 77 of ECTA.
        </p>

        <h2 style={sectionTitle}>9. Acceptable use of this website</h2>
        <ul style={list}>
          <li>Do not attempt to gain unauthorised access to any part of the website, other users'
            accounts, or our systems.</li>
          <li>Do not introduce malware, interfere with the website's operation, or place disproportionate
            load on our infrastructure.</li>
          <li>Do not submit false enquiries or fraudulent payment information.</li>
        </ul>

        <h2 style={sectionTitle}>10. Third-party services</h2>
        <p style={body}>
          Our website and services rely on reputable third-party providers, including Paystack (payments),
          Google (sign-in, analytics, and reCAPTCHA), and our hosting and database providers. Their
          services are governed by their own terms and privacy policies. We are not responsible for the
          acts or omissions of third-party providers, but we choose and configure them with care.
        </p>

        <h2 style={sectionTitle}>11. Service availability</h2>
        <p style={body}>
          We aim to keep this website and client systems available at all times, but we do not guarantee
          uninterrupted availability. Maintenance, updates, and events beyond our reasonable control may
          cause temporary downtime. Care plan clients receive monitoring and support as described in
          their plan.
        </p>

        <h2 style={sectionTitle}>12. Disclaimers and limitation of liability</h2>
        <p style={body}>
          Nothing in these terms excludes or limits any right you have under the CPA or any other law
          that cannot lawfully be excluded, and nothing excludes our liability for gross negligence or
          intentional misconduct.
        </p>
        <p style={body}>
          Subject to the above: the website and its content are provided "as is" for general information;
          we do not guarantee specific business outcomes (such as lead volumes or revenue) from any
          service; and to the maximum extent permitted by law, our total liability arising from or
          related to a service is limited to the amount you paid us for that service in the six (6)
          months preceding the claim. We are not liable for indirect or consequential loss, including
          loss of profits or data, to the extent the law allows such limitation.
        </p>

        <h2 style={sectionTitle}>13. Breach and termination</h2>
        <p style={body}>
          If either party materially breaches these terms and fails to remedy the breach within fourteen
          (14) days of written notice, the other party may terminate the affected service. On termination,
          amounts due for work already performed remain payable, and the post-termination provisions of
          our Refund &amp; Cancellation Policy apply.
        </p>

        <h2 style={sectionTitle}>14. Privacy</h2>
        <p style={body}>
          We process personal information in accordance with the Protection of Personal Information Act
          4 of 2013 ("POPIA"), as described in our{" "}
          <Link to="/privacy" style={{ color: C.accent }}>Privacy Policy</Link>, which forms part of
          these terms.
        </p>

        <h2 style={sectionTitle}>15. Disputes and governing law</h2>
        <p style={body}>
          These terms are governed by the laws of the Republic of South Africa. If a dispute arises,
          please contact us first at{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a> —
          most issues can be resolved directly within a few business days. If we cannot resolve a
          consumer dispute, you may refer it to the National Consumer Commission or another forum with
          jurisdiction under the CPA. The South African courts have jurisdiction over any dispute that
          cannot otherwise be resolved.
        </p>

        <h2 style={sectionTitle}>16. Changes to these terms</h2>
        <p style={body}>
          We may update these terms from time to time. The current version will always be published on
          this page with its effective date, and material changes affecting active clients will be
          communicated by email with reasonable notice. Continued use of the website or our services
          after changes take effect constitutes acceptance of the updated terms.
        </p>

        <h2 style={sectionTitle}>17. Contact</h2>
        <p style={body}>
          Questions about these terms can be sent to{" "}
          <a href="mailto:thabiso@zanovo.co.za" style={{ color: C.accent }}>thabiso@zanovo.co.za</a>.
          We respond within one business day.
        </p>
      </article>
    </div>
  );
}
