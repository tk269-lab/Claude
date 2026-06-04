// ============================================================
// Zanovo: lightweight client-side error capture.
//
// Captures uncaught errors and unhandled promise rejections so they
// are visible in production (previously only logged in dev). Keeps the
// last few in sessionStorage for quick inspection.
//
// This is a foundation. For persistent, searchable error tracking,
// wire a service like Sentry into `report()` later.
// ============================================================

const STORE_KEY = "zanovo_client_errors";
const MAX_STORED = 10;

function store(entry) {
  try {
    const existing = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
    existing.push(entry);
    while (existing.length > MAX_STORED) existing.shift();
    sessionStorage.setItem(STORE_KEY, JSON.stringify(existing));
  } catch {
    // sessionStorage unavailable — ignore
  }
}

function report(kind, message, detail) {
  const entry = {
    kind,
    message: String(message || "").slice(0, 500),
    detail: detail ? String(detail).slice(0, 1000) : undefined,
    url: typeof window !== "undefined" ? window.location.pathname : "",
    at: new Date().toISOString(),
  };
  // Always log (dev and prod) so errors are never silently swallowed
  // eslint-disable-next-line no-console
  console.error(`[Zanovo:${kind}]`, entry.message, detail || "");
  store(entry);
  // Hook point: forward `entry` to an error-tracking service here when added.
}

let installed = false;

export function initErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    report("error", e.message, e.error?.stack || `${e.filename}:${e.lineno}:${e.colno}`);
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    report("unhandledrejection", reason?.message || reason, reason?.stack);
  });
}

// Read captured errors (handy for debugging from the console:
// `window.__zanovoErrors()` )
export function getStoredErrors() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
  } catch {
    return [];
  }
}
