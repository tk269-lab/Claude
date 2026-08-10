import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import CookieConsent from "./CookieConsent.jsx";
import { initAnalytics } from "./lib/analytics.js";

const PrivacyPolicyPage = lazy(() => import("./PrivacyPolicyPage.jsx"));
const CheckoutPage = lazy(() => import("./CheckoutPage.jsx"));
const RefundPolicyPage = lazy(() => import("./RefundPolicyPage.jsx"));
const TermsPage = lazy(() => import("./TermsPage.jsx"));
// Shareable pricing link — sent to clients directly, not linked from the site
const PlansPage = lazy(() => import("./PlansPage.jsx"));

export default function AppRoutes() {
  // If the visitor already accepted cookies on a previous visit, load GA now
  useEffect(() => { initAnalytics(); }, []);

  return (
    <>
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/plans"
        element={(
          <Suspense fallback={null}>
            <PlansPage />
          </Suspense>
        )}
      />
      {/* Retired pages (/pricing, /login) and anything unknown — send visitors home */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/privacy"
        element={(
          <Suspense fallback={null}>
            <PrivacyPolicyPage />
          </Suspense>
        )}
      />
      <Route
        path="/checkout"
        element={(
          <Suspense fallback={null}>
            <CheckoutPage />
          </Suspense>
        )}
      />
      <Route
        path="/refund"
        element={(
          <Suspense fallback={null}>
            <RefundPolicyPage />
          </Suspense>
        )}
      />
      <Route
        path="/terms"
        element={(
          <Suspense fallback={null}>
            <TermsPage />
          </Suspense>
        )}
      />
    </Routes>
    <CookieConsent />
    </>
  );
}
