// ============================================================
// Zanovo: contact-lead helpers (ported from the original site)
// Lead validation, Supabase lead function, and invisible reCAPTCHA v3.
// ============================================================
import { validateNationalPhone } from './phoneIntl.js'
import { trackEvent } from './analytics.js'
import { getSupabaseFunctionHeaders } from './supabaseFunctions.js'

export const EMPTY_FORM = {
  name: '',
  business: '',
  email: '',
  phone: '',
  phoneCountry: 'ZA',
  message: '',
  website: '',
}

export const FIELD_LIMITS = {
  name: 120,
  business: 160,
  email: 254,
  phone: 28,
  message: 2000,
}

export const normalizeLead = (form) => ({
  name: form.name.trim(),
  business: form.business.trim(),
  email: form.email.trim().toLowerCase(),
  phone: form.phone.trim(),
  phoneCountry: form.phoneCountry,
  message: form.message.trim(),
  website: form.website.trim(),
})

export const validateLead = (lead) => {
  if (lead.website) return 'Submission could not be accepted.'
  if (!lead.name || !lead.business || !lead.email || !lead.phone) {
    return 'Please complete all required fields.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return 'Please enter a valid email address.'
  }
  const phoneErr = validateNationalPhone(lead.phone, lead.phoneCountry)
  if (phoneErr) return phoneErr
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    if ((lead[field] || '').length > limit) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is too long.`
    }
  }
  return ''
}

export const getLeadFunctionUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL')
  return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/send-lead-email`
}

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export function loadRecaptcha() {
  if (!RECAPTCHA_SITE_KEY || typeof window === 'undefined') return
  if (document.getElementById('recaptcha-v3')) return
  const s = document.createElement('script')
  s.id = 'recaptcha-v3'
  s.async = true
  s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`
  document.head.appendChild(s)
}

export function getRecaptchaToken(action, maxWaitMs = 5000) {
  return new Promise((resolve) => {
    if (!RECAPTCHA_SITE_KEY) {
      resolve(null)
      return
    }
    const deadline = Date.now() + maxWaitMs
    const tryExecute = () => {
      if (!window.grecaptcha) {
        if (Date.now() < deadline) {
          setTimeout(tryExecute, 100)
          return
        }
        resolve(null)
        return
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action }).then(resolve).catch(() => resolve(null))
      })
    }
    tryExecute()
  })
}

export const notifyWhatsAppClick = () => {
  trackEvent('whatsapp_click')
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) return
  fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/notify-whatsapp-click`, {
    method: 'POST',
    keepalive: true,
    headers: getSupabaseFunctionHeaders(),
  }).catch(() => {})
}
