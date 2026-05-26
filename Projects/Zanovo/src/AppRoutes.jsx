import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import App from "./App.jsx";

const PrivacyPolicyPage = lazy(() => import("./PrivacyPolicyPage.jsx"));
const CheckoutPage = lazy(() => import("./CheckoutPage.jsx"));
const RefundPolicyPage = lazy(() => import("./RefundPolicyPage.jsx"));
const AuthPage = lazy(() => import("./AuthPage.jsx"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
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
  );
}
