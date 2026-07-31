import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { nationalToE164, PHONE_COUNTRY_OPTIONS, validateNationalPhone } from "./lib/phoneIntl";
import { WHATSAPP_CHAT_URL } from "./constants/contact";
import { supabase } from "./lib/supabase";
import { getSupabaseFunctionHeaders } from "./lib/supabaseFunctions";
import { ADD_ONS, formatRand } from "./lib/addons";
import { PLANS as plans } from "./lib/plans";
import { trackEvent } from "./lib/analytics";

/* ─── Design tokens ─── */
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

const EMPTY_FORM = {
  name: "",
  business: "",
  email: "",
  phone: "",
  phoneCountry: "ZA",
  message: "",
  website: "",
};

const FIELD_LIMITS = {
  name: 120,
  business: 160,
  email: 254,
  phone: 28,
  message: 2000,
};

const formFields = [
  { key: "name", label: "Full name", type: "text", placeholder: "Your name" },
  { key: "business", label: "Business name", type: "text", placeholder: "Your business" },
  { key: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
];

const normalizeLead = (form) => ({
  name: form.name.trim(),
  business: form.business.trim(),
  email: form.email.trim().toLowerCase(),
  phone: form.phone.trim(),
  phoneCountry: form.phoneCountry,
  message: form.message.trim(),
  website: form.website.trim(),
});

const validateLead = (lead) => {
  if (lead.website) return "Submission could not be accepted.";
  if (!lead.name || !lead.business || !lead.email || !lead.phone) {
    return "Please complete all required fields.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return "Please enter a valid email address.";
  }
  const phoneErr = validateNationalPhone(lead.phone, lead.phoneCountry);
  if (phoneErr) return phoneErr;
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    if ((lead[field] || "").length > limit) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is too long.`;
    }
  }
  return "";
};

const getLeadFunctionUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("Missing VITE_SUPABASE_URL");
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/send-lead-email`;
};

/* ─── reCAPTCHA v3 (invisible bot protection on the contact form) ─── */
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function loadRecaptcha() {
  if (!RECAPTCHA_SITE_KEY || typeof window === "undefined") return;
  if (document.getElementById("recaptcha-v3")) return;
  const s = document.createElement("script");
  s.id = "recaptcha-v3";
  s.async = true;
  s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
  document.head.appendChild(s);
}

// Returns a verification token, or null if reCAPTCHA isn't configured/ready.
function getRecaptchaToken(action, maxWaitMs = 5000) {
  return new Promise((resolve) => {
    if (!RECAPTCHA_SITE_KEY) {
      resolve(null);
      return;
    }

    const deadline = Date.now() + maxWaitMs;
    const tryExecute = () => {
      if (!window.grecaptcha) {
        if (Date.now() < deadline) {
          setTimeout(tryExecute, 100);
          return;
        }
        resolve(null);
        return;
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(() => resolve(null));
      });
    };
    tryExecute();
  });
}

const notifyWhatsAppClick = () => {
  trackEvent("whatsapp_click");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return;
  fetch(`${supabaseUrl.replace(/\/$/, "")}/functions/v1/notify-whatsapp-click`, {
    method: "POST",
    keepalive: true,
    headers: getSupabaseFunctionHeaders(),
  }).catch(() => {}); // fire-and-forget — never block navigation
};

/* ─── Animation helpers ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

function Reveal({ children, delay = 0, className = "", style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─── Responsive hook ─── */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

/* ─── SVG Icons ─── */
const Icon = {
  bot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M12 11V7" /><circle cx="12" cy="5" r="2" />
      <path d="M8 15h.01M12 15h.01M16 15h.01" />
    </svg>
  ),
  globe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  leads: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  clock: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  arrow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

/* ─── Logo ─── */
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

/* ─── Buttons ─── */
function BtnPrimary({ children, onClick, disabled = false, style = {} }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "14px 28px", borderRadius: 10,
        background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
        color: "#fff", fontWeight: 600, fontSize: 15,
        fontFamily: "system-ui, sans-serif",
        boxShadow: `0 0 32px rgba(255,107,0,0.35)`,
        cursor: disabled ? "not-allowed" : "pointer", border: "none", ...style,
      }}
    >
      {children}
    </motion.button>
  );
}

function BtnGhost({ children, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.3)" }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "14px 28px", borderRadius: 10,
        background: "transparent", color: C.text,
        fontWeight: 600, fontSize: 15,
        fontFamily: "system-ui, sans-serif",
        border: `1px solid ${C.border}`,
        cursor: "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Navbar ─── */
const NAV_LINKS = [
  { id: "services", label: "Services" },
  { id: "process",  label: "Process" },
  { id: "pricing",  label: "Pricing" },
  { id: "contact",  label: "Contact" },
];

/* Account avatar — shows initials or person icon */
function Avatar({ name, size = 30 }) {
  const initials = name
    ? name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : null;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.accent}, #FF8533)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      fontFamily: "system-ui, sans-serif", flexShrink: 0,
      boxShadow: "0 0 12px rgba(255,107,0,0.35)",
    }}>
      {initials || (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}
    </div>
  );
}

/* Account widget — shared between desktop and mobile */
function AccountWidget({
  authUser,
  profile,
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  onSignOut,
  navigate,
}) {
  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {authUser ? (
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          aria-label="Account menu"
          style={{
            background: "none", border: `1px solid ${dropdownOpen ? "rgba(255,107,0,0.4)" : C.border}`,
            borderRadius: 10, padding: "4px 10px 4px 6px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            transition: "border-color 0.2s",
          }}
        >
          <Avatar name={profile?.full_name} size={26} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: "system-ui, sans-serif", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.full_name?.split(" ")[0] || "Account"}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : (
        <Link
          to="/login"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 9,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.text, fontSize: 13, fontWeight: 600,
            fontFamily: "system-ui, sans-serif", textDecoration: "none",
            transition: "border-color 0.2s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Sign in
        </Link>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {dropdownOpen && authUser && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 240, zIndex: 200,
              background: "rgba(14,18,26,0.98)",
              border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: "hidden",
              backdropFilter: "blur(24px)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* User info */}
            <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={profile?.full_name} size={36} />
                <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, fontFamily: "system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile?.full_name || "Your account"}
                  </p>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: "system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {authUser.email}
                  </p>
                </div>
              </div>
              {profile?.business_name && (
                <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0", fontFamily: "system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.business_name}
                </p>
              )}
            </div>

            {/* Menu items */}
            <div style={{ padding: "8px" }}>
              <button
                onClick={() => { navigate("/login?edit=1"); setDropdownOpen(false); }}
                style={{
                  width: "100%", background: "none", border: "none",
                  color: C.muted, fontSize: 13, fontWeight: 500,
                  fontFamily: "system-ui, sans-serif", cursor: "pointer",
                  padding: "9px 10px", borderRadius: 8, textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = C.text; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Edit profile
              </button>

              <div style={{ height: 1, background: C.border, margin: "6px 0" }} />

              <button
                onClick={onSignOut}
                style={{
                  width: "100%", background: "none", border: "none",
                  color: C.muted, fontSize: 13, fontWeight: 500,
                  fontFamily: "system-ui, sans-serif", cursor: "pointer",
                  padding: "9px 10px", borderRadius: 8, textAlign: "left",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,80,40,0.08)"; e.currentTarget.style.color = "#FF9A8A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.muted; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);         // mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // account dropdown
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const dropdownRef = useRef(null);
  const isMobile = useIsMobile(700);
  const navigate = useNavigate();
  const location = useLocation();

  // Smart nav: Pricing is its own page; other links scroll on the homepage,
  // or route home + anchor when clicked from another page.
  const scrollTo = (id) => {
    setOpen(false);
    if (id === "pricing") { navigate("/pricing"); return; }
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* Load auth state + profile */
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async (userId) => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, business_name")
        .eq("id", userId)
        .maybeSingle();
      if (isMounted) setProfile(data);
    };

    const applySession = async (session) => {
      if (session?.user) {
        if (!isMounted) return;
        setAuthUser(session.user);
        await loadProfile(session.user.id);
      } else if (isMounted) {
        setAuthUser(null);
        setProfile(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      style={{
        position: "fixed", top: 16, left: 0, right: 0,
        zIndex: 100, padding: "0 16px",
        display: "flex", justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <nav style={{
        width: "100%", maxWidth: 1100,
        background: "rgba(10,13,18,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${C.border}`,
        borderRadius: 14, pointerEvents: "all",
        boxSizing: "border-box", overflow: "visible",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 20px",
        }}>
          <Logo size={20} />

          {isMobile ? (
            /* Mobile: account widget + hamburger */
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AccountWidget
                authUser={authUser}
                profile={profile}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                onSignOut={handleSignOut}
                navigate={navigate}
              />
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle menu"
                style={{
                  background: "none", border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "7px 10px",
                  color: C.text, cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}
              >
                {open ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            /* Desktop: nav links + account widget */
            <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
              {NAV_LINKS.map(({ id, label }) => (
                <motion.button
                  key={id}
                  onClick={() => scrollTo(id)}
                  whileHover={{ color: C.text }}
                  style={{
                    background: "none", border: "none", color: C.muted,
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    padding: "6px 10px", borderRadius: 8,
                    transition: "color 0.2s", whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </motion.button>
              ))}
              <BtnPrimary onClick={() => scrollTo("contact")} style={{ padding: "8px 18px", fontSize: 13, marginLeft: 4 }}>
                Get Started
              </BtnPrimary>
              <div style={{ width: 1, height: 20, background: C.border, margin: "0 6px" }} />
              <AccountWidget
                authUser={authUser}
                profile={profile}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                dropdownRef={dropdownRef}
                onSignOut={handleSignOut}
                navigate={navigate}
              />
            </div>
          )}
        </div>

        {/* Mobile dropdown */}
        {isMobile && open && (
          <div style={{
            borderTop: `1px solid ${C.border}`,
            padding: "12px 20px 16px",
            display: "flex", flexDirection: "column", gap: 0,
          }}>
            {NAV_LINKS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  background: "none", border: "none", color: C.text,
                  fontSize: 15, fontWeight: 500, cursor: "pointer",
                  padding: "12px 0", textAlign: "left",
                  borderBottom: `1px solid ${C.border}`,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {label}
              </button>
            ))}
            <BtnPrimary
              onClick={() => scrollTo("contact")}
              style={{ marginTop: 14, justifyContent: "center", width: "100%" }}
            >
              Get Started
            </BtnPrimary>

            {/* Mobile: auth actions */}
            {authUser ? (
              <button
                onClick={handleSignOut}
                style={{
                  marginTop: 10, background: "none", border: "none",
                  color: C.muted, fontSize: 14, fontWeight: 500,
                  cursor: "pointer", padding: "10px 0", textAlign: "left",
                  fontFamily: "system-ui, sans-serif",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={{
                  marginTop: 10, color: C.muted, fontSize: 14, fontWeight: 500,
                  textDecoration: "none", fontFamily: "system-ui, sans-serif",
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Sign in
              </Link>
            )}
          </div>
        )}
      </nav>
    </motion.div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section style={{
      minHeight: "100svh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px 24px 80px", textAlign: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 500,
        background: "radial-gradient(ellipse, rgba(255,107,0,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Badge */}
      <motion.div {...fadeUp(0.1)} style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 16px", borderRadius: 100,
        background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)",
        color: C.accent, fontSize: 12, fontWeight: 600, marginBottom: 28,
        fontFamily: "system-ui, sans-serif", letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, display: "inline-block" }} />
        Your digital growth partner
      </motion.div>

      {/* Headline */}
      <motion.h1 {...fadeUp(0.2)} style={{
        fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 700,
        maxWidth: 860, lineHeight: 1.05, letterSpacing: "-0.03em",
        marginBottom: 24,
      }}>
        Your business deserves an online presence that{" "}
        <span style={{
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontStyle: "italic",
        }}>
          actually works.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p {...fadeUp(0.3)} style={{
        fontSize: "clamp(16px, 2vw, 20px)", color: C.muted,
        maxWidth: 600, lineHeight: 1.75, marginBottom: 40,
      }}>
        We design, build, and manage digital systems for businesses of all sizes.
        We help them attract better clients, operate more efficiently, and grow with confidence,
        backed by web design, AI automation, and a team invested in your outcomes.
      </motion.p>

      {/* CTAs */}
      <motion.div {...fadeUp(0.4)} style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <BtnPrimary onClick={() => scrollTo("contact")}>
          Book a free strategy call {Icon.arrow}
        </BtnPrimary>
        <BtnGhost onClick={() => scrollTo("services")}>
          See what we build
        </BtnGhost>
      </motion.div>

      {/* WhatsApp text link */}
      <motion.a
        {...fadeUp(0.5)}
        href={WHATSAPP_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={notifyWhatsAppClick}
        style={{
          display: "inline-flex",
          marginTop: 16,
          color: C.muted,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: "underline",
          textUnderlineOffset: 4,
          cursor: "pointer",
          transition: "color 0.2s",
        }}
        whileHover={{ color: "#25D366" }}
      >
        Prefer WhatsApp? Message us directly
      </motion.a>
    </section>
  );
}

/* ─── Pain section ─── */
const pains = [
  {
    icon: Icon.clock,
    title: "Revenue lost outside business hours",
    body: "A prospective client visits your website at 8pm, receives no response, and engages your competitor by morning. The quality of your service never came into question.",
  },
  {
    icon: Icon.globe,
    title: "A digital presence that doesn't reflect your value",
    body: "You've invested years building a reputation your clients trust. Your website should communicate that at first glance — not undermine it.",
  },
  {
    icon: Icon.leads,
    title: "Operational time spent on low-value tasks",
    body: "Chasing enquiries, sending follow-ups, reminding clients — these are hours that belong in your business, not in your inbox. There is a better way to manage that workload.",
  },
];

function PainSection() {
  return (
    <section style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
          The reality
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", maxWidth: 680, marginBottom: 20, lineHeight: 1.1 }}>
          Great businesses are losing clients every day — not because of their service, but because of the gaps in their digital presence.
        </h2>
        <p style={{ color: C.muted, maxWidth: 580, fontSize: 17, lineHeight: 1.85 }}>
          The gap between how good you are and how easy you are to find, reach, and engage —
          that's what costs you clients. We close that gap, and we stay to make sure it stays closed.
        </p>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 56 }}>
        {pains.map(({ icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.1}>
            <motion.div
              whileHover={{ borderColor: "rgba(255,107,0,0.25)", translateY: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: 32, borderRadius: 16,
                background: C.glass, border: `1px solid ${C.border}`,
                backdropFilter: "blur(12px)",
                cursor: "default",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.accent, marginBottom: 22,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 18, marginBottom: 12, fontFamily: "system-ui, sans-serif" }}>{title}</h3>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8 }}>{body}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Services / Bento grid ─── */
const services = [
  {
    icon: Icon.globe,
    title: "Website Design & Build",
    body: "A premium, conversion-optimised website that represents your business exactly as it deserves — professional, trustworthy, and built to turn visitors into paying clients. Delivered in 7 days, not months.",
    tag: "Foundation",
    span: 2,
  },
  {
    icon: Icon.chart,
    title: "Google & Local SEO",
    body: "When a client searches for what you offer, your business appears first. We manage your Google Business Profile, local keyword strategy, and deliver clear monthly ranking reports.",
    tag: "Visibility",
    span: 1,
  },
  {
    icon: Icon.leads,
    title: "Lead Capture & Follow-Up",
    body: "Structured systems — supported by smart automation — that ensure every enquiry is captured, followed up, and nurtured through to a decision. No leads fall through the cracks.",
    tag: "Client acquisition",
    span: 1,
  },
  {
    icon: Icon.bot,
    title: "Ongoing Growth Retainer",
    body: "A dedicated growth partner who monitors performance, optimises your digital presence, and keeps your systems working as your business evolves. You grow — we do the work, month after month.",
    tag: "Long-term partnership",
    span: 2,
  },
];

function ServicesSection() {
  const isMobile = useIsMobile();
  return (
    <section id="services" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal style={{ marginBottom: 56 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
          Services
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", maxWidth: 500, margin: 0 }}>
            Web design &amp; AI systems for small businesses.
          </h2>
          <p style={{ color: C.muted, maxWidth: 320, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
            Every service we offer is scoped around a single objective: sustainable client acquisition and long-term business growth.
          </p>
        </div>
      </Reveal>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: 16,
      }}>
        {services.map(({ icon, title, body, tag, span }, i) => (
          <Reveal key={title} delay={i * 0.08} style={{ gridColumn: isMobile ? "span 1" : `span ${span}` }}>
            <motion.div
              whileHover={{ borderColor: "rgba(255,107,0,0.3)", translateY: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: "32px 28px", borderRadius: 18, height: "100%",
                background: C.glass, border: `1px solid ${C.border}`,
                backdropFilter: "blur(16px)",
                cursor: "default", position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0,
                width: 180, height: 180,
                background: "radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.15)",
                color: C.accent, fontSize: 12, fontWeight: 600, marginBottom: 24,
                fontFamily: "system-ui, sans-serif",
              }}>
                {tag}
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.text, marginBottom: 18,
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 12, fontFamily: "system-ui, sans-serif" }}>{title}</h3>
              <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.65 }}>{body}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Process ─── */
const steps = [
  {
    num: "01",
    title: "Free Strategy Call",
    body: "30 minutes. We conduct a thorough audit of your current digital presence, identify the specific gaps costing you clients, and deliver a clear, actionable growth plan — at no charge, and with no obligation to proceed.",
  },
  {
    num: "02",
    title: "We Design, Build & Deliver",
    body: "Our team manages every aspect of the build. You receive regular progress updates, we handle all technical delivery, and your website and systems are live within 7 days. Professional results without the agency timeline.",
  },
  {
    num: "03",
    title: "We Grow Together",
    body: "This is where the real relationship begins. Monthly performance reviews, ongoing optimisation, and a team genuinely invested in your outcomes — not just at launch, but for the long term.",
  },
];

function ProcessSection() {
  return (
    <section id="process" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal style={{ marginBottom: 60 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
          How it works
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", maxWidth: 460, margin: 0 }}>
            From invisible to unstoppable — in three steps.
          </h2>
          <button
            type="button"
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            style={{ fontSize: 14, fontWeight: 600, color: C.accent, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0 }}
          >
            Start today {Icon.arrow}
          </button>
        </div>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {steps.map(({ num, title, body }, i) => (
          <Reveal key={num} delay={i * 0.12}>
            <div style={{
              display: "grid", gridTemplateColumns: "80px 1fr",
              gap: 32, padding: "36px 0",
              borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13, fontWeight: 700,
                color: C.accent, paddingTop: 4,
                letterSpacing: "0.05em",
              }}>
                {num}
              </div>
              <div>
                <h3 style={{ fontSize: 22, marginBottom: 10, fontFamily: "system-ui, sans-serif" }}>{title}</h3>
                <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.65, maxWidth: 560 }}>{body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
/* Plan data lives in src/lib/plans.js — shared with CheckoutPage so the
   displayed price and the charged price can never drift apart. */

/* ─── Add-ons modal ─── */
function AddOnsModal({ plan, onClose }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState([]);

  // Lock background scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const setupCents = plan.setupCents;
  const addonsCents = selected.reduce((sum, id) => {
    const a = ADD_ONS.find((x) => x.id === id);
    return sum + (a ? a.cents : 0);
  }, 0);
  const totalCents = setupCents + addonsCents;

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const goToCheckout = () => {
    trackEvent("begin_checkout", { plan: plan.slug, addons: selected.join(",") || "none" });
    const addonsParam = selected.length ? `&addons=${selected.join(",")}` : "";
    navigate(`/login?plan=${plan.slug}${addonsParam}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5,7,10,0.72)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
        padding: isMobile ? 0 : 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: isMobile ? 60 : 20, scale: isMobile ? 1 : 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isMobile ? 60 : 20, scale: isMobile ? 1 : 0.97 }}
        transition={{ duration: 0.3, ease }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 540, maxHeight: isMobile ? "92svh" : "88svh",
          overflowY: "auto",
          background: "#0E1218",
          border: `1px solid ${C.border}`,
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 1,
          padding: "24px 28px 18px",
          background: "#0E1218",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
              {plan.name}
            </p>
            <h3 style={{ fontSize: "clamp(20px, 3vw, 24px)", margin: 0, fontFamily: "system-ui, sans-serif" }}>
              Boost your package
            </h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>
              Optional services that make your website work harder. Add any that fit — or skip and continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
              color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Add-on list */}
        <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          {ADD_ONS.map((a) => {
            const isOn = selected.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left",
                  padding: "16px", borderRadius: 12, cursor: "pointer",
                  background: isOn ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${isOn ? "rgba(255,107,0,0.4)" : C.border}`,
                  transition: "background 0.15s, border-color 0.15s",
                  width: "100%",
                }}
              >
                {/* Checkbox */}
                <span style={{
                  flexShrink: 0, marginTop: 2, width: 22, height: 22, borderRadius: 6,
                  background: isOn ? `linear-gradient(135deg, ${C.accent}, ${C.accentLt})` : "transparent",
                  border: `1px solid ${isOn ? C.accent : "rgba(255,255,255,0.25)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                }}>
                  {isOn && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{a.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.accent, whiteSpace: "nowrap" }}>{formatRand(a.cents)}</span>
                  </span>
                  <span style={{ display: "block", fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 5 }}>
                    {a.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer — total + actions */}
        <div style={{
          position: "sticky", bottom: 0,
          padding: "18px 28px 24px",
          background: "#0E1218",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: C.muted }}>
              Setup total{selected.length ? ` (${selected.length} add-on${selected.length > 1 ? "s" : ""})` : ""}
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif" }}>
              {formatRand(totalCents)}
            </span>
          </div>
          <motion.button
            type="button"
            onClick={goToCheckout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "15px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
              color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "system-ui, sans-serif",
              boxShadow: "0 0 28px rgba(255,107,0,0.3)", cursor: "pointer", marginBottom: 10,
            }}
          >
            Continue to checkout {Icon.arrow}
          </motion.button>
          <button
            type="button"
            onClick={goToCheckout}
            style={{
              width: "100%", background: "none", border: "none", cursor: "pointer",
              color: C.muted, fontSize: 13, fontWeight: 500, fontFamily: "system-ui, sans-serif",
            }}
          >
            {selected.length ? "Continue without changing" : "Skip — continue without add-ons"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PricingSection() {
  const isMobile = useIsMobile();
  const [modalPlan, setModalPlan] = useState(null);
  return (
    <section id="pricing" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal style={{ marginBottom: 56, textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
          Investment
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", marginBottom: 16 }}>
          More booked jobs. Fewer missed calls. Leads that follow themselves up.
        </h2>
        <p style={{ color: C.muted, fontSize: 17, maxWidth: 620, margin: "0 auto", lineHeight: 1.85 }}>
          The real cost isn&rsquo;t the package — it&rsquo;s the leads slipping through every week:
          missed WhatsApps, unanswered enquiries, reviews you never asked for.
          Zanovo plugs the gaps. Cancel anytime. Keep your domain. Own your data.
        </p>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
        {plans.map(({ slug, name, setupCents, setupDisplay, monthlyDisplay, tag, description, features, cta, featured }, i) => (
          <Reveal key={name} delay={i * 0.1}>
            <motion.div
              whileHover={{ translateY: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: 20, overflow: "hidden",
                background: featured
                  ? `linear-gradient(160deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.04) 100%)`
                  : C.glass,
                border: featured
                  ? "1px solid rgba(255,107,0,0.35)"
                  : `1px solid ${C.border}`,
                backdropFilter: "blur(16px)",
                position: "relative",
              }}
            >
              {/* Most popular banner */}
              {tag && (
                <div style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                  padding: "8px 0", textAlign: "center",
                  fontSize: 12, fontWeight: 700,
                  fontFamily: "system-ui, sans-serif",
                  color: "#fff", letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {tag}
                </div>
              )}

              <div style={{ padding: "32px 28px" }}>
                {/* Plan name */}
                <h3 style={{
                  fontSize: 19, marginBottom: 20,
                  fontFamily: "system-ui, sans-serif",
                  color: featured ? C.accent : C.text,
                }}>
                  {name}
                </h3>

                {/* Price blocks — stacked label + value, side by side */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {/* Setup fee */}
                  <div style={{
                    padding: "14px 16px", borderRadius: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>
                      Once-off setup
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "system-ui, sans-serif", color: C.text, letterSpacing: "-0.02em" }}>
                      {setupDisplay}
                    </div>
                  </div>

                  {/* Monthly fee */}
                  <div style={{
                    padding: "14px 16px", borderRadius: 10,
                    background: featured ? "rgba(255,107,0,0.08)" : "rgba(255,255,255,0.03)",
                    border: featured ? "1px solid rgba(255,107,0,0.2)" : `1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 6, letterSpacing: "0.04em" }}>
                      Monthly retainer
                    </div>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "system-ui, sans-serif", color: featured ? C.accent : C.text, letterSpacing: "-0.02em" }}>
                        {monthlyDisplay}
                      </span>
                      <span style={{ fontSize: 11, color: C.muted, marginLeft: 3 }}>/mo</span>
                    </div>
                  </div>
                </div>

                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 24 }}>
                  {description}
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ color: featured ? C.accent : C.green, flexShrink: 0, marginTop: 1 }}>
                        {Icon.check}
                      </span>
                      <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {featured ? (
                  <BtnPrimary
                    onClick={() => { trackEvent("select_plan", { plan: slug }); setModalPlan({ slug, name, setupCents }); }}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {cta} {Icon.arrow}
                  </BtnPrimary>
                ) : (
                  <motion.button
                    onClick={() => { trackEvent("select_plan", { plan: slug }); setModalPlan({ slug, name, setupCents }); }}
                    whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
                    style={{
                      width: "100%", padding: "13px", borderRadius: 10,
                      background: "transparent", color: C.text,
                      fontWeight: 600, fontSize: 14,
                      fontFamily: "system-ui, sans-serif",
                      border: `1px solid ${C.border}`, cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >
                    {cta}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginTop: 28, lineHeight: 1.7 }}>
          If the set packages do not work for your business, we can build a custom package around exactly what you need. Book a free strategy call — the recommendation is always honest, even if it means a smaller package.
        </p>
      </Reveal>

      <AnimatePresence>
        {modalPlan && (
          <AddOnsModal plan={modalPlan} onClose={() => setModalPlan(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─── Zanovo Care: ongoing management plans ─── */
const carePlans = [
  {
    slug: "care-essential",
    name: "Essential Care",
    price: "R750",
    tag: null,
    description: "Keep your website secure, backed up, and online — the essentials, handled for you.",
    features: [
      "Managed hosting & SSL certificate",
      "Weekly automated backups",
      "Security & uptime monitoring",
      "Monthly software updates",
      "Up to 1 hour of content edits / month",
      "Email support",
    ],
    featured: false,
  },
  {
    slug: "care-pro",
    name: "Pro Care",
    price: "R1,500",
    tag: "Most Popular",
    description: "Everything kept current, plus priority help and a monthly health check on your site.",
    features: [
      "Everything in Essential Care",
      "Up to 3 hours of edits / month",
      "Priority support",
      "Monthly performance report",
      "Plugin & dependency updates",
      "Basic SEO monitoring",
    ],
    featured: true,
  },
  {
    slug: "care-premium",
    name: "Premium Care",
    price: "R2,500",
    tag: null,
    description: "Hands-off peace of mind, with ongoing strategy built into your retainer.",
    features: [
      "Everything in Pro Care",
      "Unlimited small edits (fair use)",
      "Lead & conversion monitoring",
      "Quarterly strategy review",
      "Priority turnaround",
      "WhatsApp support line",
    ],
    featured: false,
  },
];

export function CareSection() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  return (
    <section id="care" style={{ padding: isMobile ? "40px 24px 90px" : "40px 24px 110px", maxWidth: 1100, margin: "0 auto" }}>
      <Reveal style={{ marginBottom: 48, textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
          Zanovo Care
        </p>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", marginBottom: 16 }}>
          Keep it running at its best.
        </h2>
        <p style={{ color: C.muted, fontSize: 17, maxWidth: 560, margin: "0 auto", lineHeight: 1.85 }}>
          A live website is not a "set and forget" asset. Our ongoing care plans keep your
          site fast, secure, and up to date — so it keeps working long after launch. Month-to-month, cancel anytime.
        </p>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
        {carePlans.map(({ slug, name, price, tag, description, features, featured }, i) => (
          <Reveal key={name} delay={i * 0.1}>
            <motion.div
              whileHover={{ translateY: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: 20, overflow: "hidden",
                background: featured
                  ? `linear-gradient(160deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.04) 100%)`
                  : C.glass,
                border: featured ? "1px solid rgba(255,107,0,0.35)" : `1px solid ${C.border}`,
                backdropFilter: "blur(16px)",
                position: "relative",
              }}
            >
              {tag && (
                <div style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                  padding: "8px 0", textAlign: "center",
                  fontSize: 12, fontWeight: 700, fontFamily: "system-ui, sans-serif",
                  color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {tag}
                </div>
              )}

              <div style={{ padding: "32px 28px" }}>
                <h3 style={{ fontSize: 19, marginBottom: 16, fontFamily: "system-ui, sans-serif", color: featured ? C.accent : C.text }}>
                  {name}
                </h3>

                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, fontFamily: "system-ui, sans-serif", color: featured ? C.accent : C.text, letterSpacing: "-0.02em" }}>
                    {price}
                  </span>
                  <span style={{ fontSize: 13, color: C.muted, marginLeft: 4 }}>/ month</span>
                </div>

                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.65, marginBottom: 24 }}>
                  {description}
                </p>

                <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
                  {features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ color: featured ? C.accent : C.green, flexShrink: 0, marginTop: 1 }}>
                        {Icon.check}
                      </span>
                      <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {featured ? (
                  <BtnPrimary
                    onClick={() => navigate("/#contact")}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Get Started {Icon.arrow}
                  </BtnPrimary>
                ) : (
                  <motion.button
                    onClick={() => navigate("/#contact")}
                    whileHover={{ borderColor: "rgba(255,255,255,0.25)" }}
                    style={{
                      width: "100%", padding: "13px", borderRadius: 10,
                      background: "transparent", color: C.text,
                      fontWeight: 600, fontSize: 14, fontFamily: "system-ui, sans-serif",
                      border: `1px solid ${C.border}`, cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}
                  >
                    Get Started
                  </motion.button>
                )}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginTop: 28, lineHeight: 1.7 }}>
          Care plans are tailored on a quick call to match your site and how hands-on you want to be.
          Already a Zanovo client? Care can be added to your build at any time.
        </p>
      </Reveal>
    </section>
  );
}

/* ─── Contact / CTA ─── */
function ContactSection() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const isMobile = useIsMobile();

  // Load the invisible reCAPTCHA script once this section is in the page
  useEffect(() => { loadRecaptcha(); }, []);

  const includes = [
    "A full audit of your website and Google presence",
    "Clear identification of your key client acquisition gaps",
    "A practical, 90-day digital growth plan",
    "Honest recommendations — even if that means a smaller engagement",
  ];

  const handleChange = (key) => (e) => {
    const limit = FIELD_LIMITS[key];
    let value = e.target.value;
    if (key === "phone") {
      value = value.replace(/[^\d\s()+-]/g, "");
    }
    if (limit) value = value.slice(0, limit);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const inputStyle = {
    padding: "12px 16px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.border}`,
    color: C.text,
    fontSize: 15,
    outline: "none",
    width: "100%",
    fontFamily: "system-ui, sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const lead = normalizeLead(form);
    const validationError = validateLead(lead);
    if (validationError) {
      setErrorMsg(validationError);
      setStatus("error");
      return;
    }

    const phoneE164 = nationalToE164(lead.phone, lead.phoneCountry) ?? lead.phone;

    // Get an invisible reCAPTCHA token (null if not configured — backend handles that)
    const recaptchaToken = await getRecaptchaToken("submit_lead");
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setErrorMsg(
        "Security check didn't load. Please refresh the page and try again, or email us at thabiso@zanovo.co.za",
      );
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(getLeadFunctionUrl(), {
        method: "POST",
        headers: getSupabaseFunctionHeaders(),
        body: JSON.stringify({
          name: lead.name,
          business: lead.business,
          email: lead.email,
          phone: phoneE164,
          message: lead.message || null,
          recaptchaToken,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const serverMsg = payload.error || payload.message || payload.msg;
        throw new Error(serverMsg || `Lead function returned ${response.status}`);
      }

      setForm(EMPTY_FORM);
      setStatus("success");
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[Contact] submission error:", err);
      }
      const fallback = "Something went wrong. Please try again, or email us directly at thabiso@zanovo.co.za";
      const msg = err instanceof Error ? err.message : "";
      const safeServerMsg =
        msg &&
        !msg.includes("Lead function returned") &&
        !msg.toLowerCase().includes("failed to fetch") &&
        !msg.toLowerCase().includes("network");
      setErrorMsg(safeServerMsg ? msg : fallback);
      setStatus("error");
    }
  };

  return (
    <section id="contact" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{
        borderRadius: 24, overflow: "hidden",
        background: `linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(255,107,0,0.03) 100%)`,
        border: "1px solid rgba(255,107,0,0.15)",
        padding: isMobile ? "40px 24px" : "64px 48px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 40 : 64, alignItems: "start" }}>
          <Reveal>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 20 }}>
              Let's talk
            </p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 20, lineHeight: 1.1 }}>
              Not just a website agency.{" "}
              <span style={{ color: C.accent, fontStyle: "italic" }}>A growth partner.</span>
            </h2>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.85, marginBottom: 36 }}>
              We audit your current digital presence, identify the specific gaps affecting your client acquisition, and deliver a concrete plan to address them. No pitch, no pressure — just an honest conversation about what's possible for your business.
            </p>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", marginBottom: 18 }}>
              What to expect
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {includes.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ color: C.green, flexShrink: 0, marginTop: 1 }}>{Icon.check}</span>
                  <span style={{ fontSize: 15, color: C.text, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange("website")}
                style={{ display: "none" }}
                aria-hidden="true"
              />

              {formFields.map(({ key, label, type, placeholder }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required
                    maxLength={FIELD_LIMITS[key]}
                    value={form[key]}
                    onChange={handleChange(key)}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                    onBlur={(e) => { e.target.style.borderColor = C.border; }}
                  />
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>
                  Phone number
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
                  <select
                    value={form.phoneCountry}
                    required
                    aria-label="Country calling code"
                    onChange={(e) => setForm((prev) => ({ ...prev, phoneCountry: e.target.value }))}
                    style={{
                      ...inputStyle,
                      flex: "0 1 260px",
                      minWidth: 200,
                      maxWidth: "100%",
                      cursor: "pointer",
                      appearance: "auto",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                    onBlur={(e) => { e.target.style.borderColor = C.border; }}
                  >
                    {PHONE_COUNTRY_OPTIONS.map(({ iso, dial, label: countryName }) => (
                      <option key={iso} value={iso}>
                        +{dial} {countryName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="National number"
                    required
                    maxLength={FIELD_LIMITS.phone}
                    value={form.phone}
                    onChange={handleChange("phone")}
                    style={{ ...inputStyle, flex: "1 1 180px", minWidth: 140 }}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                    onBlur={(e) => { e.target.style.borderColor = C.border; }}
                  />
                </div>
                <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
                  Choose your country code, then enter your number as you would dial it locally (with area code if you normally include it). We check the digit length for the country you selected.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: "system-ui, sans-serif" }}>
                  Tell us about your business
                </label>
                <textarea
                  placeholder="What does your business do and what is your biggest challenge right now?"
                  rows={3}
                  maxLength={FIELD_LIMITS.message}
                  value={form.message}
                  onChange={handleChange("message")}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = C.border; }}
                />
              </div>

              {status === "success" && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: C.text, fontSize: 14, lineHeight: 1.6 }}>
                  Thanks. Your details have been received, and we'll be in touch within one business day.
                </div>
              )}

              {status === "error" && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,80,40,0.12)", border: "1px solid rgba(255,80,40,0.3)", color: "#FF9A8A", fontSize: 14, lineHeight: 1.6 }}>
                  {errorMsg}
                </div>
              )}

              <BtnPrimary
                style={{ marginTop: 4, justifyContent: "center", width: "100%", opacity: status === "loading" ? 0.72 : 1 }}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending..." : <>Book my free strategy call {Icon.arrow}</>}
              </BtnPrimary>
              <p style={{ fontSize: 12, color: C.muted, textAlign: "center", lineHeight: 1.6 }}>
                No commitment required. We respond within one business day to confirm your call time.
              </p>

              {/* reCAPTCHA disclosure — required by Google when the badge is hidden */}
              <p style={{ fontSize: 11, color: C.muted, textAlign: "center", lineHeight: 1.6, opacity: 0.7, margin: 0 }}>
                Protected by reCAPTCHA — Google's{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, textDecoration: "underline" }}>
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: C.muted, textDecoration: "underline" }}>
                  Terms
                </a>{" "}
                apply.
              </p>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>or</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>

              {/* WhatsApp CTA */}
              <motion.a
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={notifyWhatsAppClick}
                whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(37,211,102,0.3)" }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "13px", borderRadius: 10,
                  background: "rgba(37,211,102,0.08)",
                  border: "1px solid rgba(37,211,102,0.2)",
                  color: "#25D366", fontWeight: 600, fontSize: 14,
                  textDecoration: "none", cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  transition: "box-shadow 0.2s",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat to us on WhatsApp
              </motion.a>

              {/* Call CTA */}
              <a
                href="tel:+27630279893"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${C.border}`,
                  color: C.muted, fontWeight: 500, fontSize: 14,
                  textDecoration: "none",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call us: +27 63 027 9893
              </a>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
export function Footer() {
  const linkBtn = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
    color: C.text,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.border}`,
    textDecoration: "none",
    transition: "border-color 0.2s, background 0.2s",
  };
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`,
      padding: "40px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 16, maxWidth: 1100, margin: "0 auto",
    }}>
      <Logo size={20} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {[
          { to: "/terms", label: "Terms of service" },
          { to: "/privacy", label: "Privacy policy" },
          { to: "/refund", label: "Refund policy" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={linkBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,107,0,0.45)";
              e.currentTarget.style.background = "rgba(255,107,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
          >
            {label}
          </Link>
        ))}
        <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
          © {new Date().getFullYear()} Zanovo (Pty) Ltd. All rights reserved.
        </p>
      </div>
      <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
        Founded by Thabiso Molekwa · Cape Town, South Africa
      </p>
    </footer>
  );
}

/* ─── App ─── */
export default function App() {
  const location = useLocation();

  // When arriving with a hash (e.g. /#contact from another page), scroll to it
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      // small delay so the target section has mounted
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  return (
    <div style={{ background: C.bg, minHeight: "100svh" }}>
      <Navbar />
      <main>
        <Hero />
        <PainSection />
        <ServicesSection />
        <ProcessSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
