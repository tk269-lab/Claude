import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";
import { PHONE_COUNTRY_OPTIONS, validateNationalPhone } from "./lib/phoneIntl";

const C = {
  bg: "#0A0D12",
  glass: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#FF6B00",
  accentLt: "#FF8533",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  green: "#22C55E",
  red: "#FF9A8A",
};

const ease = [0.22, 1, 0.36, 1];

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

function Logo({ size = 24 }) {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <svg width={size} height={Math.round(size * 0.73)} viewBox="0 0 120 87" fill="none" aria-hidden>
        <defs>
          <linearGradient id="auth-lg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FF9A3C" />
          </linearGradient>
          <linearGradient id="auth-lg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CC4A00" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
        <polygon points="0,0 28,0 60,87 44,87" fill="url(#auth-lg1)" />
        <polygon points="120,0 92,0 60,87 76,87" fill="url(#auth-lg2)" />
      </svg>
      <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: size, color: C.text, letterSpacing: "-0.03em" }}>
        Zanovo
      </span>
    </Link>
  );
}

const inputStyle = (hasError = false) => ({
  padding: "12px 16px", borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: `1px solid ${hasError ? "rgba(255,80,40,0.5)" : C.border}`,
  color: C.text, fontSize: 15, outline: "none", width: "100%",
  fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s",
  boxSizing: "border-box",
});

const labelStyle = {
  fontSize: 13, fontWeight: 600, color: C.muted,
  fontFamily: "system-ui, sans-serif",
};

const errorStyle = { fontSize: 12, color: C.red };

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

function PrimaryBtn({ children, loading, disabled, type = "submit", onClick }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? { scale: 1.02 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.98 } : {}}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 24px", borderRadius: 10, border: "none",
        background: loading || disabled ? "rgba(255,107,0,0.4)" : `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
        color: "#fff", fontWeight: 700, fontSize: 15,
        fontFamily: "system-ui, sans-serif",
        boxShadow: loading || disabled ? "none" : "0 0 28px rgba(255,107,0,0.3)",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        width: "100%",
      }}
    >
      {children}
    </motion.button>
  );
}

/* ─── Step 1: Auth (sign up / sign in) ─── */
function AuthStep({ defaultMode = "signup", onSuccess }) {
  const [mode, setMode] = useState(defaultMode); // "signup" | "signin"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < 8) e.password = "Password must be at least 8 characters.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setGlobalError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        // Check if email confirmation is required
        if (data.user && !data.session) {
          setGlobalError("confirm_email");
          setLoading(false);
          return;
        }
        onSuccess(data.user, "new");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        onSuccess(data.user, "existing");
      }
    } catch (err) {
      const msg = err?.message || "Something went wrong. Please try again.";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setGlobalError("That email is already registered. Sign in instead.");
      } else if (msg.toLowerCase().includes("invalid login") || msg.toLowerCase().includes("invalid credentials")) {
        setGlobalError("Incorrect email or password.");
      } else {
        setGlobalError(msg);
      }
      setLoading(false);
    }
  };

  if (globalError === "confirm_email") {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
        style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "system-ui, sans-serif", fontSize: 22, marginBottom: 12 }}>Check your email</h2>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
          We sent a confirmation link to <strong style={{ color: C.text }}>{email}</strong>.
          Click the link to activate your account, then come back to sign in.
        </p>
        <button
          type="button"
          onClick={() => { setGlobalError(""); setMode("signin"); }}
          style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
        >
          Sign in once confirmed →
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      {/* Mode toggle */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
        padding: 4, borderRadius: 10,
        background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
        marginBottom: 28,
      }}>
        {[{ key: "signup", label: "Create account" }, { key: "signin", label: "Sign in" }].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setMode(key); setErrors({}); setGlobalError(""); }}
            style={{
              padding: "9px", borderRadius: 7, border: "none", cursor: "pointer",
              fontFamily: "system-ui, sans-serif", fontSize: 13, fontWeight: 600,
              transition: "all 0.2s",
              background: mode === key ? "rgba(255,255,255,0.08)" : "transparent",
              color: mode === key ? C.text : C.muted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email address" error={errors.email}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            autoComplete="email"
            style={inputStyle(!!errors.email)}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.email ? "rgba(255,80,40,0.5)" : C.border; }}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <input
            type="password"
            placeholder={mode === "signup" ? "Create a password (8+ characters)" : "Your password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={inputStyle(!!errors.password)}
            onFocus={(e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.password ? "rgba(255,80,40,0.5)" : C.border; }}
          />
        </Field>

        {globalError && (
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,80,40,0.1)", border: "1px solid rgba(255,80,40,0.25)", color: C.red, fontSize: 14, lineHeight: 1.6 }}>
            {globalError}
            {globalError.includes("already registered") && (
              <button type="button" onClick={() => { setMode("signin"); setGlobalError(""); }}
                style={{ display: "block", marginTop: 6, background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, padding: 0, fontFamily: "system-ui, sans-serif" }}>
                Switch to sign in →
              </button>
            )}
          </div>
        )}

        <PrimaryBtn loading={loading}>
          {loading ? "Please wait…" : mode === "signup" ? "Create account →" : "Sign in →"}
        </PrimaryBtn>

        {mode === "signin" && (
          <p style={{ fontSize: 13, color: C.muted, textAlign: "center", margin: 0 }}>
            Don't have an account?{" "}
            <button type="button" onClick={() => { setMode("signup"); setErrors({}); setGlobalError(""); }}
              style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "system-ui, sans-serif" }}>
              Create one
            </button>
          </p>
        )}
      </form>
    </motion.div>
  );
}

/* ─── Step 2: Profile form ─── */
function ProfileStep({ user, onSaved }) {
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    phone: "",
    phone_country: "ZA",
    billing_address: "",
    billing_city: "",
    billing_province: "Western Cape",
    billing_postal_code: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required.";
    if (!form.business_name.trim()) e.business_name = "Business name is required.";
    const phoneErr = validateNationalPhone(form.phone.trim(), form.phone_country);
    if (phoneErr) e.phone = phoneErr;
    if (!form.billing_address.trim()) e.billing_address = "Street address is required.";
    if (!form.billing_city.trim()) e.billing_city = "City is required.";
    if (!form.billing_postal_code.trim()) e.billing_postal_code = "Postal code is required.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setGlobalError("");
    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...form,
        full_name: form.full_name.trim(),
        business_name: form.business_name.trim(),
        phone: form.phone.trim(),
        billing_address: form.billing_address.trim(),
        billing_city: form.billing_city.trim(),
        billing_postal_code: form.billing_postal_code.trim(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      onSaved(form);
    } catch (err) {
      setGlobalError(err?.message || "Could not save your profile. Please try again.");
      setLoading(false);
    }
  };

  const iStyle = (key) => ({
    ...inputStyle(!!errors[key]),
  });

  const onFocus = (e) => { e.target.style.borderColor = "rgba(255,107,0,0.5)"; };
  const onBlur = (key) => (e) => { e.target.style.borderColor = errors[key] ? "rgba(255,80,40,0.5)" : C.border; };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Step 2 of 2
        </p>
        <h2 style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(20px, 3vw, 26px)", marginBottom: 8 }}>
          Complete your profile
        </h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          This is attached to your account and pre-fills every checkout. You only do this once.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Contact details */}
        <div style={{ padding: "16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
            Contact details
          </p>

          <Field label="Full name" error={errors.full_name}>
            <input type="text" placeholder="Your full name" value={form.full_name} onChange={set("full_name")}
              maxLength={120} style={iStyle("full_name")} onFocus={onFocus} onBlur={onBlur("full_name")} />
          </Field>

          <Field label="Business name" error={errors.business_name}>
            <input type="text" placeholder="Your business" value={form.business_name} onChange={set("business_name")}
              maxLength={160} style={iStyle("business_name")} onFocus={onFocus} onBlur={onBlur("business_name")} />
          </Field>

          <Field label="Phone number" error={errors.phone}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={form.phone_country}
                onChange={set("phone_country")}
                aria-label="Country calling code"
                style={{ ...inputStyle(), flex: "0 1 200px", minWidth: 150, cursor: "pointer", appearance: "auto" }}
                onFocus={onFocus}
                onBlur={(e) => { e.target.style.borderColor = C.border; }}
              >
                {PHONE_COUNTRY_OPTIONS.map(({ iso, dial, label }) => (
                  <option key={iso} value={iso}>+{dial} {label}</option>
                ))}
              </select>
              <input type="tel" placeholder="National number" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/[^\d\s()+-]/g, "") }))}
                maxLength={28}
                style={{ ...iStyle("phone"), flex: "1 1 130px" }}
                onFocus={onFocus} onBlur={onBlur("phone")} />
            </div>
          </Field>
        </div>

        {/* Billing address */}
        <div style={{ padding: "16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
            Billing address
          </p>

          <Field label="Street address" error={errors.billing_address}>
            <input type="text" placeholder="123 Main Street" value={form.billing_address} onChange={set("billing_address")}
              maxLength={200} style={iStyle("billing_address")} onFocus={onFocus} onBlur={onBlur("billing_address")} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="City" error={errors.billing_city}>
              <input type="text" placeholder="City" value={form.billing_city} onChange={set("billing_city")}
                maxLength={100} style={iStyle("billing_city")} onFocus={onFocus} onBlur={onBlur("billing_city")} />
            </Field>
            <Field label="Postal code" error={errors.billing_postal_code}>
              <input type="text" placeholder="0000" value={form.billing_postal_code}
                onChange={(e) => setForm((p) => ({ ...p, billing_postal_code: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                style={iStyle("billing_postal_code")} onFocus={onFocus} onBlur={onBlur("billing_postal_code")} />
            </Field>
          </div>

          <Field label="Province" error={errors.billing_province}>
            <select value={form.billing_province} onChange={set("billing_province")}
              style={{ ...inputStyle(), cursor: "pointer", appearance: "auto" }}
              onFocus={onFocus} onBlur={(e) => { e.target.style.borderColor = C.border; }}>
              {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {globalError && (
          <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,80,40,0.1)", border: "1px solid rgba(255,80,40,0.25)", color: C.red, fontSize: 14, lineHeight: 1.6 }}>
            {globalError}
          </div>
        )}

        <PrimaryBtn loading={loading}>
          {loading ? "Saving…" : "Save and continue →"}
        </PrimaryBtn>
      </form>
    </motion.div>
  );
}

/* ─── Main AuthPage ─── */
export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get("next") || "/";
  const planParam = params.get("plan");

  // step: "loading" | "auth" | "profile" | "done"
  const [step, setStep] = useState("loading");
  const [authedUser, setAuthedUser] = useState(null);

  useEffect(() => {
    document.title = "Sign in | Zanovo";
    return () => { document.title = "Web Design & AI Systems South Africa | Zanovo"; };
  }, []);

  // On mount: check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setStep("auth"); return; }
      setAuthedUser(session.user);
      const hasProfile = await checkProfile(session.user.id);
      setStep(hasProfile ? "done" : "profile");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setStep("auth");
    });
    return () => subscription.unsubscribe();
  }, []);

  // Redirect once done
  useEffect(() => {
    if (step === "done") {
      const dest = planParam ? `/checkout?plan=${planParam}` : next;
      navigate(dest, { replace: true });
    }
  }, [step, navigate, next, planParam]);

  async function checkProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", userId)
      .maybeSingle();
    return !!(data?.full_name);
  }

  const handleAuthSuccess = async (user, kind) => {
    setAuthedUser(user);
    if (kind === "existing") {
      const hasProfile = await checkProfile(user.id);
      setStep(hasProfile ? "done" : "profile");
    } else {
      // New sign-up → always collect profile
      setStep("profile");
    }
  };

  const handleProfileSaved = () => {
    setStep("done");
  };

  const cardStyle = {
    maxWidth: 480,
    margin: "0 auto",
    padding: "36px 32px",
    borderRadius: 20,
    background: C.glass,
    border: `1px solid ${C.border}`,
    backdropFilter: "blur(16px)",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100svh", color: C.text }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
        maxWidth: 1100, margin: "0 auto",
      }}>
        <Logo size={20} />
        <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: C.muted, textDecoration: "none", fontFamily: "system-ui, sans-serif" }}>
          ← Back to site
        </Link>
      </div>

      {/* Body */}
      <div style={{ padding: "48px 24px 80px" }}>
        <AnimatePresence mode="wait">
          {step === "loading" && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", paddingTop: 80, color: C.muted, fontFamily: "system-ui, sans-serif", fontSize: 15 }}>
              Loading…
            </motion.div>
          )}

          {step === "auth" && (
            <motion.div key="auth" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
              <div style={cardStyle}>
                <div style={{ marginBottom: 28, textAlign: "center" }}>
                  <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "clamp(22px, 3vw, 28px)", marginBottom: 8 }}>
                    {planParam ? "Create your account to continue" : "Welcome back"}
                  </h1>
                  <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                    {planParam
                      ? "Your account connects your profile to every payment — no re-entering details each time."
                      : "Sign in to your Zanovo account."
                    }
                  </p>
                </div>
                <AuthStep defaultMode={planParam ? "signup" : "signin"} onSuccess={handleAuthSuccess} />
              </div>
            </motion.div>
          )}

          {step === "profile" && authedUser && (
            <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease }}>
              <div style={{ ...cardStyle, maxWidth: 560 }}>
                <ProfileStep user={authedUser} onSaved={handleProfileSaved} />
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", paddingTop: 80, color: C.muted, fontFamily: "system-ui, sans-serif", fontSize: 15 }}>
              Redirecting…
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
