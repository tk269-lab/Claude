import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import App from "./App.jsx";

const PrivacyPolicyPage = lazy(() => import("./PrivacyPolicyPage.jsx"));

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
    </Routes>
  );
}
