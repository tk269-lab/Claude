import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './Home'
import CookieConsent from './CookieConsent'
import ScrollToTop from './ScrollToTop'
import { initAnalytics } from './lib/analytics'
import { initErrorLogging } from './lib/errorLogging'
import { metaFor } from './lib/routeMeta'

// The homepage ships in the main bundle; every other page downloads on visit.
const CarePage = lazy(() => import('./CarePage'))
const PlansPage = lazy(() => import('./PlansPage'))
const CheckoutPage = lazy(() => import('./CheckoutPage'))
const TermsPage = lazy(() => import('./TermsPage'))
const PrivacyPolicyPage = lazy(() => import('./PrivacyPolicyPage'))
const RefundPolicyPage = lazy(() => import('./RefundPolicyPage'))

function setTag(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    initAnalytics()
    initErrorLogging()
  }, [])

  // Title, description, share tags and canonical for the current page (see routeMeta.js).
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    setTag('meta[name="description"]', 'content', m.description)
    setTag('meta[property="og:title"]', 'content', m.title)
    setTag('meta[property="og:description"]', 'content', m.shareDescription)
    setTag('meta[name="twitter:title"]', 'content', m.title)
    setTag('meta[name="twitter:description"]', 'content', m.shareDescription)
    setTag('link[rel="canonical"]', 'href', m.url)
    setTag('meta[property="og:url"]', 'content', m.url)

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (m.noindex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.name = 'robots'
        document.head.appendChild(robots)
      }
      robots.content = 'noindex, nofollow'
    } else {
      robots?.remove()
    }
  }, [pathname])

  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-white" />}>
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
      </Suspense>
      <CookieConsent />
      <ScrollToTop />
    </>
  )
}
