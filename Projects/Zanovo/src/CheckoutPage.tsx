import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Check, Lock } from 'lucide-react'
import { Navbar, Footer, CONTACT_EMAIL } from './site'
import { PHONE_COUNTRY_OPTIONS, validateNationalPhone, nationalToE164 } from './lib/phoneIntl.js'
import { trackEvent } from './lib/analytics.js'
import { ADD_ON_MAP, formatRand, parseAddonParam } from './lib/addons.js'
import { ALL_PLAN_MAP, PLAN_MAP } from './lib/plans.js'

declare global {
  interface Window {
    PaystackPop?: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } }
  }
}

const EFT_DETAILS = {
  bank: 'Discovery Bank',
  accountHolder: 'Thabiso Molekwa',
  accountNumber: '11449650740',
  accountType: 'Transaction Account',
  branchCode: '679000',
}

/* Shape of a payable plan as it comes out of lib/plans.js. Build packs carry a
   once-off setupCents; Care retainers are monthly only. */
type Plan = {
  slug: string
  name: string
  kind: string
  setupCents?: number
  monthlyCents: number
  features: string[]
}

const inputCls =
  'w-full rounded-[10px] border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FF6B00] transition-colors'

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-[12px] text-red-600 mt-1">{error}</span>}
    </label>
  )
}

function EftRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-[10px] px-3.5 py-2.5 bg-gray-50">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900">{value}</span>
    </div>
  )
}

const EMPTY = { name: '', business: '', email: '', phone: '', phoneCountry: 'ZA' }

export default function CheckoutPage() {
  const [params] = useSearchParams()
  const [method, setMethod] = useState<'eft' | 'card'>('card')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [paystackReady, setPaystackReady] = useState(false)
  const [cardStatus, setCardStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [success, setSuccess] = useState<'card' | 'eft' | null>(null)

  const plan: Plan = ALL_PLAN_MAP[params.get('plan') || 'growth'] || PLAN_MAP.growth
  const isCare = plan.kind === 'care'
  const selectedAddons: string[] = isCare ? [] : parseAddonParam(params.get('addons'))
  const addonsCents = selectedAddons.reduce((sum, id) => sum + ADD_ON_MAP[id].cents, 0)
  const todayCents = isCare ? plan.monthlyCents : (plan.setupCents || 0) + addonsCents
  const todayDisplay = formatRand(todayCents)
  const monthlyDisplay = formatRand(plan.monthlyCents)
  const eftReference = 'ZANOVO-' + plan.slug.toUpperCase()

  useEffect(() => {
    document.title = 'Checkout | Zanovo'
    window.scrollTo(0, 0)
  }, [])

  // Load Paystack inline script
  useEffect(() => {
    if (document.getElementById('paystack-js')) {
      setPaystackReady(true)
      return
    }
    const s = document.createElement('script')
    s.id = 'paystack-js'
    s.src = 'https://js.paystack.co/v1/inline.js'
    s.async = true
    s.onload = () => setPaystackReady(true)
    document.body.appendChild(s)
  }, [])

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.business.trim()) e.business = 'Business name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'A valid email address is required.'
    const phoneErr = validateNationalPhone(form.phone.trim(), form.phoneCountry)
    if (phoneErr) e.phone = phoneErr
    return e
  }

  const handleEft = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    trackEvent('payment_submitted', { method: 'eft', plan: plan.slug, value: todayCents / 100 })
    setSuccess('eft')
  }

  const handleCardPay = () => {
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY
    if (!key || !paystackReady || !window.PaystackPop) {
      setCardStatus('error')
      return
    }
    setCardStatus('loading')
    trackEvent('payment_submitted', { method: 'card', plan: plan.slug, value: todayCents / 100 })
    const handler = window.PaystackPop.setup({
      key,
      email: form.email.trim().toLowerCase(),
      amount: todayCents,
      currency: 'ZAR',
      ref: `zanovo-${plan.slug}-${Date.now()}`,
      channels: ['card'],
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: form.name.trim() },
          { display_name: 'Business Name', variable_name: 'business_name', value: form.business.trim() },
          { display_name: 'Phone', variable_name: 'phone', value: nationalToE164(form.phone.trim(), form.phoneCountry) ?? form.phone.trim() },
          { display_name: 'Plan', variable_name: 'plan', value: plan.name },
          { display_name: 'Add-ons', variable_name: 'addons', value: selectedAddons.map((id) => ADD_ON_MAP[id].name).join(', ') || 'None' },
          { display_name: 'Total', variable_name: 'total', value: todayDisplay },
        ],
      },
      callback: () => {
        trackEvent('purchase', { method: 'card', plan: plan.slug, value: todayCents / 100, currency: 'ZAR' })
        setSuccess('card')
      },
      onClose: () => setCardStatus('idle'),
    })
    handler.openIframe()
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="bg-[#EFEFEF] min-h-screen text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="w-full max-w-[520px] bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#16a34a]/10 border border-[#16a34a]/25 flex items-center justify-center mx-auto mb-6">
              <Check size={26} className="text-[#16a34a]" />
            </div>
            <h1 className="text-[24px] font-semibold tracking-tight mb-2">
              {success === 'eft' ? 'Booking received.' : "Payment received. You're in."}
            </h1>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
              {success === 'eft' ? (
                <>Your EFT details for the <strong className="text-gray-900">{plan.name}</strong> have been submitted. Once we confirm receipt of your payment, we'll reach out within one business day{isCare ? ' to activate your care plan.' : ' to schedule your planning call.'}</>
              ) : (
                <>Your {isCare ? 'first month' : 'setup fee'} for the <strong className="text-gray-900">{plan.name}</strong> has been received. We'll reach out within one business day{isCare ? ' to confirm your care plan.' : ' to schedule your planning call.'}</>
              )}
            </p>
            <Link to="/" className="inline-flex items-center justify-center rounded-full bg-[#0A0D12] text-white text-[14px] font-medium px-6 py-3">
              Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-[#EFEFEF] min-h-screen text-gray-900">
      <Navbar />

      <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-20">
        <h1 className="font-medium tracking-[-0.02em] mb-2" style={{ fontSize: 'clamp(26px, 4vw, 40px)' }}>
          Your order
        </h1>
        <p className="text-[15px] text-gray-600 mb-8 max-w-[560px]">
          {isCare
            ? 'Review your Zanovo Care plan below. Care is billed monthly and starts as soon as your payment is confirmed.'
            : 'Review your selection below. Your monthly retainer only begins once your website and systems are live.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
          {/* ── Left: payment ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 order-2 lg:order-1">
            <div className="flex gap-3 rounded-[12px] bg-[#FF6B00]/[0.06] border border-[#FF6B00]/20 p-4 mb-7">
              <Check size={18} className="text-[#FF6B00] shrink-0 mt-0.5" />
              <p className="text-[13px] text-gray-700 leading-relaxed">
                {isCare ? (
                  <><strong className="text-gray-900">Your care plan starts right away.</strong> Once payment is confirmed, your site is actively monitored and maintained — month-to-month, cancel anytime.</>
                ) : (
                  <><strong className="text-gray-900">You will receive a call before we build anything.</strong> Once payment is confirmed, we will contact you within one business day to schedule a dedicated planning session.</>
                )}
              </p>
            </div>

            <h2 className="text-[16px] font-semibold mb-4">Your details</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <Field label="Full name" error={errors.name}><input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} className={inputCls} /></Field>
              <Field label="Business name" error={errors.business}><input type="text" placeholder="Your business" value={form.business} onChange={set('business')} className={inputCls} /></Field>
              <Field label="Email address" error={errors.email}><input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} className={inputCls} /></Field>
              <Field label="Phone number" error={errors.phone}>
                <div className="flex gap-2">
                  <select value={form.phoneCountry} onChange={set('phoneCountry')} aria-label="Country calling code" className={`${inputCls} cursor-pointer max-w-[120px]`}>
                    {PHONE_COUNTRY_OPTIONS.map(({ iso, dial }: { iso: string; dial: string }) => (
                      <option key={iso} value={iso}>{iso} +{dial}</option>
                    ))}
                  </select>
                  <input type="tel" placeholder="National number" value={form.phone} onChange={set('phone')} className={`${inputCls} flex-1`} />
                </div>
              </Field>
            </div>

            <h2 className="text-[16px] font-semibold mb-4">Payment method</h2>
            <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-[10px] mb-6">
              {([{ key: 'card', label: 'Pay by Card' }, { key: 'eft', label: 'Pay via EFT' }] as const).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`py-2.5 rounded-[7px] text-[14px] font-medium transition-colors ${method === m.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === 'eft' ? (
              <form onSubmit={handleEft} className="flex flex-col gap-2.5">
                <EftRow label="Bank" value={EFT_DETAILS.bank} />
                <EftRow label="Account holder" value={EFT_DETAILS.accountHolder} />
                <EftRow label="Account number" value={EFT_DETAILS.accountNumber} />
                <EftRow label="Account type" value={EFT_DETAILS.accountType} />
                <EftRow label="Branch code" value={EFT_DETAILS.branchCode} />
                <EftRow label="Payment reference (use exactly)" value={eftReference} />
                <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
                  After making the transfer, email your proof of payment to{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#FF6B00] font-medium">{CONTACT_EMAIL}</a>.
                </p>
                <button type="submit" className="mt-2 w-full rounded-full bg-[#FF6B00] hover:bg-[#CC4A00] text-white py-3 text-[14px] font-medium transition-colors">
                  I've made the EFT payment
                </button>
              </form>
            ) : (
              <div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
                  Visa and Mastercard. Card details entered securely via Paystack — we never see your card number.
                </p>
                {cardStatus === 'error' && (
                  <div className="rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-[13px] px-3.5 py-3 mb-4">
                    Payment couldn't start. Please refresh and try again, or use EFT.
                  </div>
                )}
                <button
                  onClick={handleCardPay}
                  disabled={cardStatus === 'loading'}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#FF6B00] hover:bg-[#CC4A00] disabled:opacity-70 text-white py-3 text-[14px] font-medium transition-colors"
                >
                  <Lock size={15} />
                  {cardStatus === 'loading' ? 'Opening payment…' : `Pay ${todayDisplay} securely`}
                </button>
                <p className="text-[12px] text-gray-400 text-center mt-3">256-bit SSL encryption · Powered by Paystack</p>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 order-1 lg:order-2 lg:sticky lg:top-6">
            <h2 className="text-[16px] font-semibold mb-1">Order summary</h2>
            <div className="mt-4 pb-5 border-b border-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{plan.name}</p>
                  <p className="text-[13px] text-gray-500 mt-1">
                    {isCare ? 'Monthly care plan · billed monthly' : `Once-off setup fee · then ${monthlyDisplay}/mo after go-live`}
                  </p>
                </div>
                <span className="text-[15px] font-bold text-gray-900 whitespace-nowrap">
                  {isCare ? `${monthlyDisplay}/mo` : formatRand(plan.setupCents || 0)}
                </span>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={14} className="text-[#16a34a] shrink-0 mt-0.5" />
                    <span className="text-[12px] text-gray-600 leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {selectedAddons.length > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col gap-2">
                  <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Add-ons</p>
                  {selectedAddons.map((id) => (
                    <div key={id} className="flex items-center justify-between gap-3">
                      <span className="text-[13px] text-gray-700">{ADD_ON_MAP[id].name}</span>
                      <span className="text-[13px] font-semibold text-gray-900 whitespace-nowrap">{formatRand(ADD_ON_MAP[id].cents)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-5">
              <span className="text-[15px] font-bold text-gray-900">Total today</span>
              <span className="text-[20px] font-bold text-[#FF6B00]">{todayDisplay}</span>
            </div>
            <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
              {isCare
                ? `${monthlyDisplay}/month, billed monthly. Cancel anytime with one calendar month's notice.`
                : `Then ${monthlyDisplay}/mo retainer, starting only after your site goes live.`}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
