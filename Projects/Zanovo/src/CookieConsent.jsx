import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getConsent, setConsent, loadGA, trackEvent } from "./lib/analytics";

const C = {
  glass: "#0E1218",
  border: "rgba(255,255,255,0.1)",
  accent: "#FF6B00",
  accentLt: "#FF8533",
  text: "#F9FAFB",
  muted: "#9CA3AF",
};

const ease = [0.22, 1, 0.36, 1];

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Show the banner only if the visitor has not chosen yet
  useEffect(() => {
    if (!getConsent()) setVisible(true);
  }, []);

  const accept = () => {
    setConsent("granted");
    loadGA();
    // Record the acceptance so it appears in GA
    trackEvent("cookie_consent", { status: "granted" });
    setVisible(false);
  };

  const decline = () => {
    setConsent("denied");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease }}
          role="dialog"
          aria-label="Cookie consent"
          style={{
            position: "fixed",
            left: isMobile ? 12 : 20,
            right: isMobile ? 12 : 20,
            bottom: isMobile ? 12 : 20,
            zIndex: 2000,
            maxWidth: 760,
            margin: "0 auto",
            background: C.glass,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            boxShadow: "0 16px 50px rgba(0,0,0,0.5)",
            padding: isMobile ? "18px 18px" : "20px 24px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 14 : 20,
          }}
        >
          <p
            style={{
              flex: 1,
              margin: 0,
              fontSize: 13.5,
              lineHeight: 1.65,
              color: C.muted,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            We use cookies to understand how visitors use our site and to improve your
            experience. You can accept analytics cookies or continue with only essential
            ones. See our{" "}
            <Link
              to="/privacy"
              style={{ color: C.accent, textDecoration: "none", fontWeight: 600 }}
            >
              Privacy Policy
            </Link>
            .
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexShrink: 0,
              flexDirection: isMobile ? "row" : "row",
            }}
          >
            <button
              type="button"
              onClick={decline}
              style={{
                flex: isMobile ? 1 : "none",
                padding: "11px 18px",
                borderRadius: 9,
                background: "transparent",
                border: `1px solid ${C.border}`,
                color: C.text,
                fontSize: 13.5,
                fontWeight: 600,
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Decline
            </button>
            <motion.button
              type="button"
              onClick={accept}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: isMobile ? 1 : "none",
                padding: "11px 22px",
                borderRadius: 9,
                border: "none",
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 0 20px rgba(255,107,0,0.3)",
              }}
            >
              Accept
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
