import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import PricingPage from "./PricingPage.jsx";
import CookieConsent from "./CookieConsent.jsx";
import { initAnalytics } from "./lib/analytics.js";

const PrivacyPolicyPage = lazy(() => import("./PrivacyPolicyPage.jsx"));
const CheckoutPage = lazy(() => import("./CheckoutPage.jsx"));
const RefundPolicyPage = lazy(() => import("./RefundPolicyPage.jsx"));
const AuthPage = lazy(() => import("./AuthPage.jsx"));

export default function AppRoutes() {
  // If the visitor already accepted cookies on a previous visit, load GA now
  useEffect(() => { initAnalytics(); }, []);

  return (
    <>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/pricing" element={<PricingPage />} />
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
        path="/login"
        element={(
          <Suspense fallback={null}>
            <AuthPage />
          </Suspense>
        )}
      />
    </Routes>
    <CookieConsent />
    </>
  );
}
