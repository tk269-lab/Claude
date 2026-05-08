import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabase";   // ← Supabase client

/* ─────────────────────────────────────────────
   DESIGN SYSTEM
───────────────────────────────────────────── */
const FONT_DISPLAY = "'DM Serif Display', Georgia, serif";
const FONT_BODY    = "'DM Sans', system-ui, sans-serif";
const C_DARK       = "#0A0D12";
const C_ORANGE     = "#FF6B00";
const C_ORANGE_LT  = "#FF9A3C";
const C_CREAM      = "#FAF9F7";
const C_MID        = "#6B7280";
const C_BORDER     = "#E8E6E1";

const ease = [0.22, 1, 0.36, 1];

const useFade = (threshold = "-80px") => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: threshold });
  return { ref, inView };
};

const Reveal = ({ children, delay = 0, y = 32, className = "" }) => {
  const { ref, inView } = useFade();
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }} className={className}>
      {children}
    </motion.div>
  );
};

/* ── V-Mark Logo SVG ── */
const VMark = ({ size = 36 }) => (
  <svg width={size} height={Math.round(size * 0.73)} viewBox="0 0 120 87" fill="none">
    <defs>
      <linearGradient id="vg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B00" />
        <stop offset="100%" stopColor="#FF9A3C" />
      </linearGradient>
      <linearGradient id="vg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CC4A00" />
        <stop offset="100%" stopColor="#FF6B00" />
      </linearGradient>
    </defs>
    <polygon points="0,0 28,0 60,87 44,87" fill="url(#vg1)" />
    <polygon points="120,0 92,0 60,87 76,87" fill="url(#vg2)" />
  </svg>
);

const Logo = ({ light = false, size = 28 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <VMark size={size} />
    <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.28em", fontSize: "1.15rem", color: light ? "#FFFFFF" : C_DARK, lineHeight: 1 }}>ZANOVO</span>
  </div>
);

/* ────────────────────────────────
   NAV
──────────────────────────────── */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Services", "Process", "Results", "About"];

  return (
    <>
      <motion.nav initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, ease }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "background 0.4s, border-color 0.4s, backdrop-filter 0.4s", background: scrolled ? "rgba(255,255,255,0.97)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", borderBottom: scrolled ? `1px solid ${C_BORDER}` : "1px solid transparent" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <Logo light={!scrolled} />
          <div style={{ display: "flex", alignItems: "center", gap: 40 }} className="hide-mobile">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", fontWeight: 500, letterSpacing: "0.04em", color: scrolled ? C_DARK : "rgba(255,255,255,0.82)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C_ORANGE}
                onMouseLeave={e => e.target.style.color = scrolled ? C_DARK : "rgba(255,255,255,0.82)"}>
                {l}
              </a>
            ))}
            <a href="#contact" style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.06em", color: "#fff", background: C_DARK, padding: "10px 24px", borderRadius: 3, textDecoration: "none", transition: "background 0.2s", border: scrolled ? `1px solid ${C_DARK}` : "1px solid rgba(255,255,255,0.3)" }}
              onMouseEnter={e => e.target.style.background = C_ORANGE}
              onMouseLeave={e => e.target.style.background = C_DARK}>
              Book Free Call
            </a>
          </div>
          <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <div style={{ width: 24, display: "flex", flexDirection: "column", gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ height: 1.5, background: scrolled ? C_DARK : "#fff", borderRadius: 2, transition: "transform 0.3s, opacity 0.3s", transform: menuOpen ? (i === 1 ? "scaleX(0)" : i === 0 ? "rotate(45deg) translate(4px,4px)" : "rotate(-45deg) translate(4px,-4px)") : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />
              ))}
            </div>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            style={{ position: "fixed", top: 72, left: 0, right: 0, zIndex: 99, background: "#fff", borderBottom: `1px solid ${C_BORDER}`, padding: "24px 32px 32px" }}>
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                style={{ display: "block", fontFamily: FONT_BODY, fontSize: "1.1rem", fontWeight: 500, color: C_DARK, padding: "12px 0", borderBottom: `1px solid ${C_BORDER}`, textDecoration: "none" }}>
                {l}
              </a>
            ))}
            <a href="#contact" onClick={() => setMenuOpen(false)}
              style={{ display: "block", marginTop: 20, fontFamily: FONT_BODY, fontSize: "0.9rem", fontWeight: 600, color: "#fff", background: C_DARK, padding: "14px 24px", borderRadius: 3, textAlign: "center", textDecoration: "none" }}>
              Book a Free Call
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ────────────────────────────────
   HERO
──────────────────────────────── */
const Hero = () => {
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 60]);

  return (
    <section style={{ minHeight: "100vh", background: C_DARK, display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 65% 40%, rgba(255,107,0,0.06) 0%, transparent 65%)" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.6 }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", right: "-2vw", top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(200px, 28vw, 420px)", color: "rgba(255,107,0,0.03)", lineHeight: 1, userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em" }}>ZV</div>

      <motion.div style={{ y: yText, position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "120px 32px 80px", width: "100%" }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, ease }} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div style={{ width: 32, height: 1, background: C_ORANGE }} />
          <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE_LT, textTransform: "uppercase" }}>Systems that drive growth</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35, ease }}
          style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(3rem, 7.5vw, 6.5rem)", color: "#fff", lineHeight: 1.05, fontWeight: 400, maxWidth: 820, margin: 0 }}>
          Your business deserves an online presence that{" "}
          <em style={{ color: C_ORANGE, fontStyle: "italic" }}>actually works.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6, ease }}
          style={{ fontFamily: FONT_BODY, fontSize: "clamp(1rem, 1.5vw, 1.15rem)", color: "rgba(255,255,255,0.58)", lineHeight: 1.75, maxWidth: 520, marginTop: 28 }}>
          You've built something worth finding. We build the digital foundation — websites, lead systems, and Google presence — that turns great reviews into a steady flow of new customers.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8, ease }}
          style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 48, flexWrap: "wrap" }}>
          <a href="#contact" style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.88rem", letterSpacing: "0.06em", color: "#fff", background: C_ORANGE, padding: "16px 36px", borderRadius: 3, textDecoration: "none", display: "inline-block", transition: "background 0.2s, transform 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#E55A00"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C_ORANGE; e.currentTarget.style.transform = "translateY(0)"; }}>
            Book a Free Strategy Call
          </a>
          <a href="#services" style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: "0.88rem", letterSpacing: "0.06em", color: "rgba(255,255,255,0.65)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}>
            See our work
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.1 }}
          style={{ display: "flex", gap: 48, marginTop: 80, paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
          {[["150+", "Businesses transformed"], ["3.2×", "Average lead increase"], ["14 days", "Average build time"]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: "2.2rem", color: "#fff", lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.25))" }} />
      </motion.div>
    </section>
  );
};

/* ── TRUST BAR ── */
const TrustBar = () => {
  const categories = ["Hospitality", "Home Services", "Health & Wellness", "Professional Services", "Food & Beverage", "Retail", "Legal", "Trades", "Beauty & Grooming", "Fitness"];
  const doubled = [...categories, ...categories];
  return (
    <div style={{ background: C_CREAM, borderTop: `1px solid ${C_BORDER}`, borderBottom: `1px solid ${C_BORDER}`, padding: "16px 0", overflow: "hidden" }}>
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 64, width: "max-content" }}>
        {doubled.map((cat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: C_ORANGE }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.14em", color: C_MID, textTransform: "uppercase" }}>{cat}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ── PROBLEM ── */
const Problem = () => (
  <section style={{ background: "#fff", padding: "120px 32px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="grid-1-col-mobile">
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 32, height: 1, background: C_ORANGE }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>The reality</span>
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C_DARK, lineHeight: 1.12, fontWeight: 400, margin: 0 }}>
            Great businesses are losing customers every day to a poor website.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p style={{ fontFamily: FONT_BODY, fontSize: "1.05rem", color: C_MID, lineHeight: 1.85, marginBottom: 32 }}>
            You've spent years building your reputation. Customers love you. But when someone searches for what you do, they find a website that doesn't reflect any of that — or worse, no website at all.
          </p>
          <p style={{ fontFamily: FONT_BODY, fontSize: "1.05rem", color: C_MID, lineHeight: 1.85 }}>
            In 8 seconds, they've moved on. To a competitor. With worse service. Better marketing.
          </p>
          <div style={{ marginTop: 40, padding: "24px 28px", borderLeft: `3px solid ${C_ORANGE}`, background: C_CREAM }}>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: "1.25rem", color: C_DARK, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
              "94% of first impressions are based on your website. You don't get a second chance."
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ── SERVICES ── */
const services = [
  { num: "01", title: "Website Design & Build", desc: "A premium, fast-loading website that converts visitors into enquiries. Built to represent your business exactly as it deserves — professional, trustworthy, and unmistakably yours.", detail: ["Mobile-first responsive design", "Built in under 14 days", "CMS so you can update it yourself", "Conversion-optimised layout"] },
  { num: "02", title: "Lead Generation Systems", desc: "Automated booking forms, contact flows, and follow-up sequences that capture every enquiry — even while you're on the job or sleeping.", detail: ["Online booking integration", "Automated email follow-up", "Lead tracking dashboard", "WhatsApp & SMS alerts"] },
  { num: "03", title: "Google & Local SEO", desc: "We make sure that when someone in your area searches for what you do, you're the first name they see — not your competitor.", detail: ["Google Business Profile setup", "Local keyword optimisation", "Review strategy & management", "Monthly ranking reports"] },
  { num: "04", title: "Ongoing Growth Retainer", desc: "A dedicated growth partner who monitors, optimises, and improves your digital presence every month. You grow — we do the work.", detail: ["Monthly performance reviews", "Ongoing content & SEO updates", "A/B testing & conversion work", "Priority support access"] },
];

const Services = () => {
  const [active, setActive] = useState(null);
  return (
    <section id="services" style={{ background: C_CREAM, padding: "120px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64, flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 32, height: 1, background: C_ORANGE }} />
                <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>Services</span>
              </div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C_DARK, lineHeight: 1.12, fontWeight: 400, margin: 0, maxWidth: 500 }}>Everything you need to win online — nothing you don't.</h2>
            </div>
            <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: C_MID, maxWidth: 300, lineHeight: 1.75 }}>We don't do bloated packages. Every service is designed around one goal: getting your business more customers.</p>
          </div>
        </Reveal>
        <div>
          {services.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.08}>
              <div onClick={() => setActive(active === i ? null : i)} style={{ borderTop: `1px solid ${C_BORDER}`, padding: "32px 0", cursor: "pointer", borderBottom: i === services.length - 1 ? `1px solid ${C_BORDER}` : "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
                  <div style={{ display: "flex", gap: 32, flex: 1, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, color: C_ORANGE, letterSpacing: "0.1em", paddingTop: 4, minWidth: 28 }}>{s.num}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", color: C_DARK, fontWeight: 400, margin: 0 }}>{s.title}</h3>
                        <motion.div animate={{ rotate: active === i ? 45 : 0 }} transition={{ duration: 0.3 }} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${active === i ? C_ORANGE : C_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16, background: active === i ? C_ORANGE : "transparent", transition: "background 0.3s, border-color 0.3s" }}>
                          <svg width="12" height="12" fill="none" stroke={active === i ? "#fff" : C_MID} strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        </motion.div>
                      </div>
                      <AnimatePresence>
                        {active === i && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }} style={{ overflow: "hidden" }}>
                            <div style={{ paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="grid-1-col-mobile">
                              <p style={{ fontFamily: FONT_BODY, fontSize: "0.95rem", color: C_MID, lineHeight: 1.8, margin: 0 }}>{s.desc}</p>
                              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                                {s.detail.map(d => (
                                  <li key={d} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C_ORANGE, flexShrink: 0 }} />
                                    <span style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", color: C_DARK }}>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── PROCESS ── */
const Process = () => {
  const steps = [
    { num: "01", title: "Free Strategy Call", body: "30 minutes. No fluff. We audit your current online presence, identify exactly what's costing you customers, and give you a clear plan — whether you work with us or not." },
    { num: "02", title: "We Design & Build", body: "Our team gets to work. You get regular updates, we handle every technical detail, and your new site is live within 14 days. No endless feedback loops." },
    { num: "03", title: "Launch & Handover", body: "We launch, walk you through everything, and make sure you're confident. You own 100% of what we build — no lock-in, no surprises." },
    { num: "04", title: "Grow Together", body: "Monthly reviews, optimisations, and support. We track what's working, improve what isn't, and scale what is. Your growth is the only metric we care about." },
  ];
  return (
    <section id="process" style={{ background: C_DARK, padding: "120px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: C_ORANGE }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>How it works</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 80, flexWrap: "wrap", gap: 24 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.12, fontWeight: 400, margin: 0, maxWidth: 460 }}>From invisible to unstoppable — in four steps.</h2>
            <a href="#contact" style={{ fontFamily: FONT_BODY, fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", color: C_ORANGE, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>Start today →</a>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }} className="grid-2-col-mobile">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.1}>
              <motion.div whileHover={{ backgroundColor: "rgba(255,107,0,0.04)" }} style={{ padding: "32px 24px", borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none", borderRight: "1px solid rgba(255,255,255,0.08)", transition: "background 0.3s" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.85rem", color: C_ORANGE, letterSpacing: "0.12em", marginBottom: 24 }}>{s.num}</div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.25rem", color: "#fff", fontWeight: 400, margin: "0 0 16px", lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.8, margin: 0 }}>{s.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── RESULTS ── */
const testimonials = [
  { quote: "Within six weeks of launching our new site, our inquiry volume doubled. The booking system alone saves us hours every week. Zanovo didn't just build us a website — they built us a revenue machine.", name: "Sarah M.", role: "Owner, The Green Apron Bakery", metric: "+200%", metricLabel: "Inquiry increase" },
  { quote: "I had 47 five-star reviews and a site that looked like 2009. Customers were finding me and leaving. Zanovo completely turned that around. Within a month, I was fully booked two weeks out.", name: "David K.", role: "Founder, CleanRight Plumbing", metric: "3×", metricLabel: "More booked jobs" },
  { quote: "The team understood exactly what we needed — not just a designer, but someone who gets conversion, customer psychology, and how real small businesses actually work. Genuinely invaluable.", name: "Priya R.", role: "Director, Blossom Wellness Spa", metric: "+158%", metricLabel: "Online bookings" },
];

const Results = () => {
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 6000); return () => clearInterval(t); }, []);
  return (
    <section id="results" style={{ background: "#fff", padding: "120px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: C_ORANGE }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>Results</span>
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: C_DARK, lineHeight: 1.12, fontWeight: 400, margin: "0 0 64px", maxWidth: 560 }}>Businesses like yours are already growing.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="grid-1-col-mobile">
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: "3rem", color: C_ORANGE, lineHeight: 1, marginBottom: 8 }}>"</div>
                <p style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.15rem, 2vw, 1.45rem)", color: C_DARK, lineHeight: 1.65, fontStyle: "italic", margin: "0 0 32px" }}>{testimonials[active].quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C_ORANGE}, ${C_ORANGE_LT})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, color: "#fff", fontSize: "1rem" }}>{testimonials[active].name[0]}</div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.88rem", color: C_DARK }}>{testimonials[active].name}</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: "0.78rem", color: C_MID, marginTop: 2 }}>{testimonials[active].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", gap: 8, marginTop: 40 }}>
              {testimonials.map((_, i) => (<button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? C_ORANGE : C_BORDER, border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} onClick={() => setActive(i)} whileHover={{ x: 4 }} style={{ padding: "24px 28px", border: `1px solid ${i === active ? C_ORANGE : C_BORDER}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: i === active ? "#fff" : C_CREAM, transition: "all 0.3s" }}>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.82rem", color: C_DARK }}>{t.name}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: C_MID, marginTop: 2 }}>{t.role}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: "1.7rem", color: C_ORANGE, lineHeight: 1 }}>{t.metric}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: "0.7rem", color: C_MID, letterSpacing: "0.06em", marginTop: 3 }}>{t.metricLabel}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── ABOUT ── */
const About = () => (
  <section id="about" style={{ background: C_CREAM, padding: "120px 32px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 80, alignItems: "start" }} className="grid-1-col-mobile">
        <Reveal>
          <div style={{ position: "sticky", top: 120 }}>
            <VMark size={64} />
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: C_DARK, lineHeight: 1.15, fontWeight: 400, margin: "28px 0 0" }}>Not just a website agency.</h2>
            <p style={{ fontFamily: FONT_DISPLAY, fontStyle: "italic", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: C_ORANGE, lineHeight: 1.15, fontWeight: 400, margin: "4px 0 0" }}>A growth partner.</p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <div style={{ width: 32, height: 1, background: C_ORANGE }} />
            <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>About Zanovo</span>
          </div>
          <p style={{ fontFamily: FONT_BODY, fontSize: "1.05rem", color: C_MID, lineHeight: 1.85, marginBottom: 24 }}>Zanovo was founded after seeing one pattern repeat itself too many times: exceptional small businesses — tradespeople, restaurateurs, health practitioners, service providers — struggling to grow online despite having everything it takes to succeed.</p>
          <p style={{ fontFamily: FONT_BODY, fontSize: "1.05rem", color: C_MID, lineHeight: 1.85, marginBottom: 48 }}>The problem was never the business. It was always the digital foundation. So we built a company to fix exactly that — with a process that's fast, transparent, and built around results you can actually measure.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C_BORDER }}>
            {[["No lock-in contracts", "We earn your business month to month."], ["You own everything", "Your site, your data, your content. Always."], ["14-day builds", "Professional results without the 3-month wait."], ["Plain English", "No jargon, no hidden fees, no surprises."]].map(([title, body]) => (
              <div key={title} style={{ background: "#fff", padding: "28px 24px" }}>
                <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.85rem", color: C_DARK, marginBottom: 6 }}>{title}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: C_MID, lineHeight: 1.6 }}>{body}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ────────────────────────────────
   CONTACT  ← SUPABASE + ZOHO INTEGRATED
──────────────────────────────── */
const EMPTY_FORM = { name: "", business: "", email: "", phone: "", message: "" };

const Contact = () => {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [status, setStatus]     = useState("idle");   // "idle"|"loading"|"success"|"error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (key) => (e) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      // ── Step 1: Save lead to Supabase `leads` table ──────────
      const { error: dbError } = await supabase
        .from("leads")
        .insert([{
          name:     form.name.trim(),
          business: form.business.trim(),
          email:    form.email.trim().toLowerCase(),
          phone:    form.phone.trim(),
          message:  form.message.trim() || null,
        }]);

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      // ── Step 2: Trigger Edge Function → Zoho SMTP email ──────
      const fnRes = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-lead-email`,
        {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            name:     form.name.trim(),
            business: form.business.trim(),
            email:    form.email.trim().toLowerCase(),
            phone:    form.phone.trim(),
            message:  form.message.trim() || "—",
          }),
        }
      );

      if (!fnRes.ok) {
        const errBody = await fnRes.json().catch(() => ({}));
        throw new Error(errBody.error || `Email function returned ${fnRes.status}`);
      }

      setStatus("success");
      setForm(EMPTY_FORM);

    } catch (err) {
      console.error("[Contact] submission error:", err);
      setErrorMsg("Something went wrong — please try again, or email us directly at thabiso@zanovo.co.za");
      setStatus("error");
    }
  };

  /* ── Shared styles ── */
  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3,
    padding: "12px 16px", fontFamily: FONT_BODY, fontSize: "0.9rem",
    color: "#fff", outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };
  const onFocus = e => e.target.style.borderColor = C_ORANGE;
  const onBlur  = e => e.target.style.borderColor = "rgba(255,255,255,0.1)";
  const labelStyle = {
    fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600,
    letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase", display: "block", marginBottom: 8,
  };

  return (
    <section id="contact" style={{ background: C_DARK, padding: "120px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="grid-1-col-mobile">

          {/* ── Left ── */}
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 1, background: C_ORANGE }} />
              <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.22em", color: C_ORANGE, textTransform: "uppercase" }}>Let's talk</span>
            </div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: "#fff", lineHeight: 1.12, fontWeight: 400, margin: "0 0 24px" }}>
              Book your free 30-minute strategy call.
            </h2>
            <p style={{ fontFamily: FONT_BODY, fontSize: "1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.85, margin: "0 0 48px" }}>
              We'll audit your online presence, identify what's costing you customers, and give you a concrete plan to fix it. No pitch, no pressure — just clarity.
            </p>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 20 }}>What to expect</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {["A full audit of your website & Google presence", "Identification of your biggest growth gaps", "A clear, actionable 90-day plan", "Honest advice — even if you don't need us"].map(p => (
                <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", border: `1px solid ${C_ORANGE}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <svg width="8" height="8" fill="none" stroke={C_ORANGE} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span style={{ fontFamily: FONT_BODY, fontSize: "0.88rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{p}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* ── Right — form / success / error ── */}
          <Reveal delay={0.15}>
            {status === "success" ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`, padding: "60px 40px", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: C_ORANGE, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.8rem", color: "#fff", margin: "0 0 12px", fontWeight: 400 }}>We'll be in touch.</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>Your details have been received. Expect a response within one business day to confirm your call time.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "48px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

                <div><label style={labelStyle}>Your name</label>
                  <input type="text" placeholder="Jane Smith" required value={form.name} onChange={handleChange("name")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div><label style={labelStyle}>Business name</label>
                  <input type="text" placeholder="Smith & Co Plumbing" required value={form.business} onChange={handleChange("business")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div><label style={labelStyle}>Email address</label>
                  <input type="email" placeholder="jane@smithplumbing.co.za" required value={form.email} onChange={handleChange("email")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div><label style={labelStyle}>Phone number</label>
                  <input type="tel" placeholder="+27 82 000 0000" required value={form.phone} onChange={handleChange("phone")} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>

                <div><label style={labelStyle}>Anything else we should know? (optional)</label>
                  <textarea rows={3} placeholder="Tell us a bit about your business..." value={form.message} onChange={handleChange("message")} style={{ ...inputStyle, resize: "vertical" }} onFocus={onFocus} onBlur={onBlur} />
                </div>

                {status === "error" && (
                  <div style={{ background: "rgba(255,80,40,0.12)", border: "1px solid rgba(255,80,40,0.3)", borderRadius: 3, padding: "12px 16px" }}>
                    <p style={{ fontFamily: FONT_BODY, fontSize: "0.82rem", color: "#FF8070", margin: 0, lineHeight: 1.6 }}>{errorMsg}</p>
                  </div>
                )}

                <button type="submit" disabled={status === "loading"}
                  style={{ width: "100%", background: status === "loading" ? "#994000" : C_ORANGE, color: "#fff", fontFamily: FONT_BODY, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em", padding: "16px", border: "none", borderRadius: 3, cursor: status === "loading" ? "not-allowed" : "pointer", marginTop: 8, transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  onMouseEnter={e => { if (status !== "loading") e.currentTarget.style.background = "#E55A00"; }}
                  onMouseLeave={e => { if (status !== "loading") e.currentTarget.style.background = C_ORANGE; }}>
                  {status === "loading" ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                        </path>
                      </svg>
                      Sending…
                    </>
                  ) : "Book My Free Strategy Call →"}
                </button>

                <p style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                  No credit card. No commitment. Response within 1 business day.
                </p>
              </form>
            )}
          </Reveal>

        </div>
      </div>
    </section>
  );
};

/* ── FOOTER ── */
const Footer = () => (
  <footer style={{ background: "#070A0F", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 32px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
      <Logo light />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: C_ORANGE }} />
        <span style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>SYSTEMS THAT DRIVE GROWTH.</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["Privacy", "Terms", "Contact"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: FONT_BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = C_ORANGE}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}>
            {l}
          </a>
        ))}
      </div>
    </div>
    <div style={{ maxWidth: 1200, margin: "20px auto 0", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <p style={{ fontFamily: FONT_BODY, fontSize: "0.72rem", color: "rgba(255,255,255,0.18)", margin: 0, textAlign: "center" }}>
        © {new Date().getFullYear()} Zanovo. All rights reserved.
      </p>
    </div>
  </footer>
);

/* ────────────────────────────────
   APP
──────────────────────────────── */
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body { background: ${C_DARK}; }
        ::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C_DARK}; }
        ::-webkit-scrollbar-thumb { background: ${C_ORANGE}; border-radius: 3px; }
        .hide-mobile { display: flex !important; }
        .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
          .grid-1-col-mobile { grid-template-columns: 1fr !important; gap: 40px !important; }
          .grid-2-col-mobile { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .grid-2-col-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Services />
        <Process />
        <Results />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
