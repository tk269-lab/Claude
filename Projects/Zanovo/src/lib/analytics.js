// ============================================================
// Zanovo: consent-aware Google Analytics (GA4)
// GA only loads AFTER the visitor accepts cookies (POPIA-friendly).
// ============================================================

const GA_ID = "G-4DSM0NP01C";
export const CONSENT_KEY = "zanovo_cookie_consent"; // "granted" | "denied"

let gaLoaded = false;

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked — ignore */
  }
}

// Injects the GA script + config. Safe to call multiple times.
export function loadGA() {
  if (gaLoaded || typeof window === "undefined" || !GA_ID) return;
  gaLoaded = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

// Call on app start: if the visitor already accepted, load GA immediately.
export function initAnalytics() {
  if (getConsent() === "granted") loadGA();
}

// Fire a custom event — only if consent was granted and GA is loaded.
export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (getConsent() !== "granted") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
