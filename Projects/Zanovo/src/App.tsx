import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import CarePage from './CarePage'
import PlansPage from './PlansPage'
import CheckoutPage from './CheckoutPage'
import TermsPage from './TermsPage'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import RefundPolicyPage from './RefundPolicyPage'
import CookieConsent from './CookieConsent'
import ScrollToTop from './ScrollToTop'
import { initAnalytics } from './lib/analytics'
import { initErrorLogging } from './lib/errorLogging'

export default function App() {
  useEffect(() => {
    initAnalytics()
    initErrorLogging()
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/care" element={<CarePage />} />
        {/* Shareable pricing link — sent to clients directly, not linked from the site */}
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        {/* Retired pages (/pricing, /login) and anything unknown — send visitors home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
      <ScrollToTop />
    </>
  )
}
