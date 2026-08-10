import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, setConsent, loadGA, trackEvent } from './lib/analytics'

/* POPIA-friendly cookie banner — GA only loads after the visitor accepts. */
export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!getConsent()) setShow(true)
  }, [])

  const accept = () => {
    setConsent('granted')
    loadGA()
    trackEvent('cookie_consent', { value: 'granted' })
    setShow(false)
  }
  const decline = () => {
    setConsent('denied')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="mx-auto max-w-[680px] rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-[13px] leading-relaxed text-gray-600 flex-1">
          We use cookies to understand how visitors use our site and improve your experience. See our{' '}
          <Link to="/privacy" className="text-[#FF6B00] font-medium">Privacy Policy</Link>.
        </p>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={decline}
            className="text-[13px] font-medium text-gray-700 border border-gray-300 rounded-full px-4 py-2 hover:border-gray-400 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-[13px] font-medium text-white bg-[#FF6B00] hover:bg-[#CC4A00] rounded-full px-5 py-2 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
