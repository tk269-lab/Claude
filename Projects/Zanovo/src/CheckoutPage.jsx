import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PHONE_COUNTRY_OPTIONS, validateNationalPhone, nationalToE164 } from "./lib/phoneIntl";
import { supabase } from "./lib/supabase";
import { ADD_ONS, ADD_ON_MAP, formatRand, parseAddonParam } from "./lib/addons";
import { trackEvent } from "./lib/analytics";

const C = {
  bg: "#0A0D12",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#FF6B00",
  accentLt: "#FF8533",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  green: "#22C55E",
};

const ease = [0.22, 1, 0.36, 1];

const EFT_DETAILS = {
  bank: "Discovery Bank",
  accountHolder: "Thabiso Molekwa",
  accountNumber: "11449650740",
  accountType: "Transaction Account",
  branchCode: "679000",
};

const PLANS = {
  starter: {
    slug: "starter",
    name: "Starter Pack",
    tag: "Foundation",
    setupDisplay: "R6,500",
    setupCents: 650000,
    monthlyDisplay: "R2,500",
    features: [
      "5-page mobile-optimised website",
      "Lead capture & enquiry management",
      "Google Business Profile setup",
      "Automated review requests (Email & WhatsApp)",
      "Monthly performance report",
    ],
  },
  growth: {
    slug: "growth",
    name: "Growth Pack",
    tag: "Most Popular",
    setupDisplay: "R9,500",
    setupCents: 950000,
    monthlyDisplay: "R5,500",
    features: [
      "Everything in Starter",
      "AI webchat",
      "AI chatbot with lead qualification",
      "Automated follow-ups (Email & WhatsApp)",
      "Missed-call text-back",
      "CRM integration & lead dashboard",
      "Reputation management",
    ],
  },
  "growth-max": {
    slug: "growth-max",
    name: "Growth Max Pack",
    tag: "Full Partnership",
    setupDisplay: "R25,000",
    setupCents: 2500000,
    monthlyDisplay: "R9,500",
    features: [
      "Everything in Growth",
      "AI SMS nurture sequences",
      "Custom landing pages & funnels",
      "Advanced booking & intake automation",
      "Priority support",
      "Monthly strategy call",
    ],
  },
};

const EMPTY_FORM = { name: "", business: "", email: "", phone: "", phoneCountry: "ZA" };

/* ─── Helpers ─── */
function useIsMobile(bp = 768) {
  const [v, setV] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return v;
}

function makeRef(business, clientName, planName) {
  const clean = (s) => s.trim().replace(/[^A-Za-z0-9 ]/g, "").trim() || "–";
  return `${clean(business)}-${clean(clientName)}-${clean(planName)}`;
}

/* ─── Sub-components ─── */
function Logo({ size = 24 }) {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
      <img src="/zanovo-submark-transparent.png" alt="Zanovo" height={size * 1.5} style={{ display: "block", marginRight: -6 }} />
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: size, color: C.text, letterSpacing: "-0.03em" }}>
        Zanovo
      </span>
    </Link>
  );
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

function CopyField({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", borderRadius: 8,
        background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "system-ui, sans-serif" }}>
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: copied ? C.green : C.muted,
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 500, padding: "2px 4px",
            transition: "color 0.2s", whiteSpace: "nowrap",
          }}
        >
          {copied ? "Copied" : <><CopyIcon /> Copy</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Success screen ─── */
function SuccessScreen({ plan, method }) {
  return (
    <div style={{ background: C.bg, minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }} style={{ maxWidth: 520 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px", color: C.green,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", marginBottom: 16, fontFamily: "system-ui, sans-serif" }}>
          {method === "eft" ? "Booking received." : "Payment received. You're in."}
        </h1>
        <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
          {method === "eft"
            ? <>Your EFT details for the <strong style={{ color: C.text }}>{plan.name}</strong> have been submitted. Once we confirm receipt of your payment, we will reach out within one business day to schedule your planning call.</>
            : <>Your setup fee for the <strong style={{ color: C.text }}>{plan.name}</strong> has been received. We will reach out within one business day to schedule your planning call.</>
          }
        </p>
        <div style={{ padding: "20px 24px", borderRadius: 14, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)", textAlign: "left", marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            What happens next
          </p>
          {(method === "eft"
            ? ["Send your proof of payment to thabiso@zanovo.co.za", "We confirm receipt and reach out within one business day", "We schedule your planning call before anything is built"]
            : ["We review your business and current online presence", "You receive a call to plan every detail of your build", "We deliver your website and systems within 7 days of the call"]
          ).map((step, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < arr.length - 1 ? 10 : 0 }}>
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: C.accent, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{step}</span>
            </div>
          ))}
        </div>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          <ArrowLeft /> Back to home
        </Link>
      </motion.div>
    </div>
  );
}

/* ─── Main page ─── */
export default function CheckoutPage() {
  useEffect(() => {
    document.title = "Pricing & Checkout | Zanovo";
    return () => { document.title = "Web Design & AI Systems South Africa | Zanovo"; };
  }, []);

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planKey = params.get("plan") || "growth";
  const plan = PLANS[planKey] || PLANS.growth;

  // Add-ons selected from the pricing modal (editable here)
  const [addonIds, setAddonIds] = useState(() => parseAddonParam(params.get("addons")));
  const selectedAddons = addonIds.map((id) => ADD_ON_MAP[id]).filter(Boolean);
  const availableAddons = ADD_ONS.filter((a) => !addonIds.includes(a.id));
  const addonsCents = selectedAddons.reduce((sum, a) => sum + a.cents, 0);
  const totalCents = plan.setupCents + addonsCents;
  const totalDisplay = formatRand(totalCents);

  const removeAddon = (id) => setAddonIds((ids) => ids.filter((x) => x !== id));
  const addAddon = (id) => setAddonIds((ids) => (ids.includes(id) ? ids : [...ids, id]));

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [payMethod, setPayMethod] = useState("card"); // "eft" | "card"
  const [cardStatus, setCardStatus] = useState("idle"); // idle | loading | error
  const [eftStatus, setEftStatus] = useState("idle");   // idle | submitted
  const [successMethod, setSuccessMethod] = useState(null);
  const [paystackReady, setPaystackReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const isMobile = useIsMobile();

  /* ── Auth guard + profile pre-fill ── */
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        const addonsQS = params.get("addons") ? `&addons=${params.get("addons")}` : "";
        navigate(`/login?plan=${planKey}${addonsQS}`, { replace: true });
        return;
      }
      setAuthUser(session.user);

      // Pre-fill form from saved profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, business_name, phone, phone_country")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setForm({
          name: profile.full_name || "",
          business: profile.business_name || "",
          email: session.user.email || "",
          phone: profile.phone || "",
          phoneCountry: profile.phone_country || "ZA",
        });
      } else {
        setForm((f) => ({ ...f, email: session.user.email || "" }));
      }

      setAuthChecked(true);
    });
  }, [navigate, planKey]);

  const paymentRef = makeRef(form.business, form.name, plan.name);

  /* Load Paystack inline script */
  useEffect(() => {
    if (document.getElementById("paystack-js")) { setPaystackReady(true); return; }
    const script = document.createElement("script");
    script.id = "paystack-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackReady(true);
    document.body.appendChild(script);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.business.trim()) e.business = "Business name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "A valid email address is required.";
    const phoneErr = validateNationalPhone(form.phone.trim(), form.phoneCountry);
    if (phoneErr) e.phone = phoneErr;
    return e;
  };

  /* EFT submit — just captures name + email, shows success */
  const handleEftSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    trackEvent("payment_submitted", { method: "eft", plan: plan.slug, value: totalCents / 100 });
    setSuccessMethod("eft");
  };

  /* Card submit — Paystack popup */
  const handleCardPay = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key || !paystackReady || !window.PaystackPop) {
      setCardStatus("error");
      return;
    }
    setCardStatus("loading");
    trackEvent("payment_submitted", { method: "card", plan: plan.slug, value: totalCents / 100 });
    const handler = window.PaystackPop.setup({
      key,
      email: form.email.trim().toLowerCase(),
      amount: totalCents,
      currency: "ZAR",
      ref: `zanovo-${plan.slug}-${Date.now()}`,
      channels: ["card"],
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: form.name.trim() },
          { display_name: "Business Name", variable_name: "business_name", value: form.business.trim() },
          { display_name: "Phone", variable_name: "phone", value: nationalToE164(form.phone.trim(), form.phoneCountry) ?? form.phone.trim() },
          { display_name: "Plan", variable_name: "plan", value: plan.name },
          { display_name: "Add-ons", variable_name: "addons", value: selectedAddons.map((a) => a.name).join(", ") || "None" },
          { display_name: "Total", variable_name: "total", value: totalDisplay },
          { display_name: "User ID", variable_name: "user_id", value: authUser?.id ?? "" },
        ],
      },
      callback: () => {
        trackEvent("purchase", { method: "card", plan: plan.slug, value: totalCents / 100, currency: "ZAR" });
        setSuccessMethod("card");
      },
      onClose: () => { setCardStatus("idle"); },
    });
    handler.openIframe();
  };

  if (!authChecked) return null; // redirect in progress or loading
  if (successMethod) return <SuccessScreen plan={plan} method={successMethod} />;

  const inputStyle = {
    padding: "12px 16px", borderRadius: 10,
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    color: C.text, fontSize: 15, outline: "none", width: "100%",
    fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const isEft = payMethod === "eft";

  return (
    <div style={{ background: C.bg, minHeight: "100svh" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "16px 20px" : "20px 32px",
        borderBottom: `1px solid ${C.border}`,
        maxWidth: 1100, margin: "0 auto",
      }}>
        <Logo size={20} />
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
          <ArrowLeft /> Back
        </Link>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: isMobile ? "36px 20px 60px" : "64px 32px",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 48 : 80,
        alignItems: "start",
      }}>

        {/* ── Left: Cart ── */}
        <div>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", marginBottom: 8, fontFamily: "system-ui, sans-serif" }}>
            Your order
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Review your selection below. Your monthly retainer only begins once your website and systems are live.
          </p>

          {/* Plan line item */}
          <div style={{ padding: "20px 22px", borderRadius: 16, background: C.glass, border: `1px solid ${C.border}`, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 100,
                  background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.15)",
                  color: C.accent, fontSize: 11, fontWeight: 600, marginBottom: 10,
                }}>
                  {plan.tag}
                </div>
                <h3 style={{ fontSize: 20, margin: 0, fontFamily: "system-ui, sans-serif" }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: C.muted, margin: "4px 0 0" }}>Once-off setup fee · then {plan.monthlyDisplay}/mo after go-live</p>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>
                {plan.setupDisplay}
              </div>
            </div>

            <div style={{ height: 1, background: C.border, margin: "16px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {plan.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: C.green, flexShrink: 0, marginTop: 1 }}><CheckIcon /></span>
                  <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-on line items */}
          {selectedAddons.map((a) => (
            <div key={a.id} style={{ padding: "18px 22px", borderRadius: 16, background: C.glass, border: `1px solid ${C.border}`, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ fontSize: 16, margin: 0, fontFamily: "system-ui, sans-serif", color: C.text }}>{a.name}</h4>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: "5px 0 0" }}>{a.desc}</p>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>
                  {formatRand(a.cents)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAddon(a.id)}
                style={{
                  marginTop: 12, background: "none", border: "none", cursor: "pointer",
                  color: C.muted, fontSize: 13, fontWeight: 500, padding: 0,
                  fontFamily: "system-ui, sans-serif", textDecoration: "underline", textUnderlineOffset: 3,
                }}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add more services */}
          {availableAddons.length > 0 && (
            <div style={{ padding: "18px 22px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: `1px dashed ${C.border}`, marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
                Add more to your order
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {availableAddons.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{a.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>{formatRand(a.cents)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.55, margin: "4px 0 0" }}>{a.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addAddon(a.id)}
                      style={{
                        flexShrink: 0, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                        background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)",
                        color: C.accent, fontSize: 13, fontWeight: 600, fontFamily: "system-ui, sans-serif",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reassurance */}
          <div style={{ padding: "20px 20px", borderRadius: 14, marginTop: 14, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.18)" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
              Important — read before paying
            </p>
            <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 10 }}>
              <strong>You will receive a call before we build anything.</strong> Once payment is confirmed, we will contact you within one business day to schedule a dedicated planning session.
            </p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
              Nothing happens without your input and approval. You are in full control of the direction.
            </p>
          </div>

          {/* Custom package note */}
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 16, textAlign: "center" }}>
            If this package does not quite fit, we can build a custom one around exactly what your business needs.{" "}
            <a href="/#contact" style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}>
              Book a free strategy call
            </a>{" "}
            and we will put it together with you.
          </p>
        </div>

        {/* ── Right: Payment panel ── */}
        <div style={{
          padding: isMobile ? "28px 20px" : "32px 28px", borderRadius: 20,
          background: C.glass, border: `1px solid ${C.border}`,
          backdropFilter: "blur(16px)",
          position: isMobile ? "static" : "sticky", top: 32,
        }}>
          {/* Order summary */}
          <div style={{ padding: "18px 18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px" }}>
              Order summary
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 9 }}>
              <span style={{ fontSize: 14, color: C.text }}>{plan.name} · setup</span>
              <span style={{ fontSize: 14, color: C.text, whiteSpace: "nowrap" }}>{plan.setupDisplay}</span>
            </div>
            {selectedAddons.map((a) => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 9 }}>
                <span style={{ fontSize: 14, color: C.muted }}>{a.name}</span>
                <span style={{ fontSize: 14, color: C.muted, whiteSpace: "nowrap" }}>{formatRand(a.cents)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: "14px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Total today</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, whiteSpace: "nowrap", fontFamily: "system-ui, sans-serif" }}>{totalDisplay}</span>
            </div>
            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, margin: "10px 0 0" }}>
              Then {plan.monthlyDisplay}/mo retainer, starting only after your site goes live.
            </p>
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>
            Secure checkout
          </p>
          <h2 style={{ fontSize: 22, marginBottom: 20, fontFamily: "system-ui, sans-serif" }}>
            Complete your booking
          </h2>

          {/* Payment method toggle */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24,
            padding: 4, borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
          }}>
            {[
              { key: "eft", label: "Pay via EFT" },
              { key: "card", label: "Pay by Card" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setPayMethod(key); setErrors({}); }}
                style={{
                  padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 600,
                  transition: "background 0.2s, color 0.2s",
                  background: payMethod === key
                    ? `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`
                    : "transparent",
                  color: payMethod === key ? "#fff" : C.muted,
                  boxShadow: payMethod === key ? "0 0 16px rgba(255,107,0,0.3)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Shared fields: name, business, email, phone */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>

            {/* Full name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                maxLength={120}
                style={{ ...inputStyle, borderColor: errors.name ? "rgba(255,80,40,0.5)" : C.border }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.name ? "rgba(255,80,40,0.5)" : C.border; }}
              />
              {errors.name && <span style={{ fontSize: 12, color: "#FF9A8A" }}>{errors.name}</span>}
            </div>

            {/* Business name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>Business name</label>
              <input
                type="text"
                placeholder="Your business"
                value={form.business}
                onChange={(e) => setForm((p) => ({ ...p, business: e.target.value }))}
                maxLength={160}
                style={{ ...inputStyle, borderColor: errors.business ? "rgba(255,80,40,0.5)" : C.border }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.business ? "rgba(255,80,40,0.5)" : C.border; }}
              />
              {errors.business && <span style={{ fontSize: 12, color: "#FF9A8A" }}>{errors.business}</span>}
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                maxLength={254}
                style={{ ...inputStyle, borderColor: errors.email ? "rgba(255,80,40,0.5)" : C.border }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.email ? "rgba(255,80,40,0.5)" : C.border; }}
              />
              {errors.email && <span style={{ fontSize: 12, color: "#FF9A8A" }}>{errors.email}</span>}
              <span style={{ fontSize: 12, color: C.muted }}>Your booking confirmation will be sent here.</span>
            </div>

            {/* Phone number */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>Phone number</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch" }}>
                <select
                  value={form.phoneCountry}
                  aria-label="Country calling code"
                  onChange={(e) => setForm((p) => ({ ...p, phoneCountry: e.target.value }))}
                  style={{
                    ...inputStyle,
                    flex: "0 1 220px", minWidth: 160, maxWidth: "100%",
                    cursor: "pointer", appearance: "auto",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = C.border; }}
                >
                  {PHONE_COUNTRY_OPTIONS.map(({ iso, dial, label: cn }) => (
                    <option key={iso} value={iso}>+{dial} {cn}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="National number"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^\d\s()+-]/g, "") }))}
                  maxLength={28}
                  style={{
                    ...inputStyle, flex: "1 1 160px", minWidth: 130,
                    borderColor: errors.phone ? "rgba(255,80,40,0.5)" : C.border,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.phone ? "rgba(255,80,40,0.5)" : C.border; }}
                />
              </div>
              {errors.phone && <span style={{ fontSize: 12, color: "#FF9A8A" }}>{errors.phone}</span>}
            </div>

          </div>

          <AnimatePresence mode="wait">
            {isEft ? (
              /* ── EFT panel ── */
              <motion.form
                key="eft"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
                onSubmit={handleEftSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Banking details */}
                <div style={{ padding: "18px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                    Banking details
                  </p>
                  <CopyField label="Bank" value={EFT_DETAILS.bank} />
                  <CopyField label="Account holder" value={EFT_DETAILS.accountHolder} />
                  <CopyField label="Account number" value={EFT_DETAILS.accountNumber} />
                  <CopyField label="Account type" value={EFT_DETAILS.accountType} />
                  <CopyField label="Branch code" value={EFT_DETAILS.branchCode} />
                  <CopyField label="Amount" value={totalDisplay} />
                  <CopyField
                    label="Payment reference (use exactly)"
                    value={paymentRef}
                  />
                </div>

                <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)" }}>
                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.65, margin: 0 }}>
                    After making the transfer, email your proof of payment to{" "}
                    <strong style={{ color: C.accent }}>thabiso@zanovo.co.za</strong>
                    {" "}with your name and plan in the subject line. We confirm within one business day.
                  </p>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "15px 24px", borderRadius: 10, marginTop: 4,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    fontFamily: "system-ui, sans-serif",
                    boxShadow: "0 0 32px rgba(255,107,0,0.35)",
                    cursor: "pointer", border: "none",
                  }}
                >
                  I've made the EFT transfer
                </motion.button>

                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                  Only click this once you have completed the bank transfer.
                </p>

                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                  By proceeding you agree to our{" "}
                  <Link to="/refund" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}>
                    Refund &amp; Cancellation Policy
                  </Link>
                  .
                </p>
              </motion.form>
            ) : (
              /* ── Card panel ── */
              <motion.form
                key="card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease }}
                onSubmit={handleCardPay}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Card logos */}
                <div style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ width: 38, height: 24, borderRadius: 4, background: "#1A1F71", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.03em" }}>VISA</span>
                    </div>
                    <div style={{ width: 38, height: 24, borderRadius: 4, background: "#252525", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EB001B" }} />
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#F79E1B", marginLeft: -6 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                    Visa and Mastercard. Card details entered securely via Paystack — we never see your card number.
                  </span>
                </div>

                {cardStatus === "error" && (
                  <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,80,40,0.12)", border: "1px solid rgba(255,80,40,0.3)", color: "#FF9A8A", fontSize: 14, lineHeight: 1.6 }}>
                    Card payments are not yet active. Please use EFT or email us at thabiso@zanovo.co.za.
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={cardStatus === "loading"}
                  whileHover={cardStatus !== "loading" ? { scale: 1.02 } : {}}
                  whileTap={cardStatus !== "loading" ? { scale: 0.98 } : {}}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "15px 24px", borderRadius: 10,
                    background: cardStatus === "loading" ? "rgba(255,107,0,0.5)" : `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                    color: "#fff", fontWeight: 700, fontSize: 15,
                    fontFamily: "system-ui, sans-serif",
                    boxShadow: cardStatus === "loading" ? "none" : "0 0 32px rgba(255,107,0,0.35)",
                    cursor: cardStatus === "loading" ? "not-allowed" : "pointer", border: "none",
                  }}
                >
                  {cardStatus === "loading" ? "Opening payment..." : <>Pay {totalDisplay} securely</>}
                </motion.button>

                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                  256-bit SSL encryption · Powered by Paystack · No lock-in contracts
                </p>

                <p style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                  By proceeding you agree to our{" "}
                  <Link to="/refund" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}>
                    Refund &amp; Cancellation Policy
                  </Link>
                  .
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
