import { useEffect, useState } from 'react'
import {
  Globe,
  Users,
  Activity,
  Bot,
  Check,
  ArrowRight,
  Megaphone,
  Share2,
  TrendingUp,
  HeartHandshake,
  Workflow,
  ChevronDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { EASE, OrangeButton } from './site'
import { PHONE_COUNTRY_OPTIONS } from './lib/phoneIntl.js'
import { getSupabaseFunctionHeaders } from './lib/supabaseFunctions.js'
import { nationalToE164 } from './lib/phoneIntl.js'
import {
  EMPTY_FORM,
  FIELD_LIMITS,
  normalizeLead,
  validateLead,
  getLeadFunctionUrl,
  loadRecaptcha,
  getRecaptchaToken,
  notifyWhatsAppClick,
  RECAPTCHA_SITE_KEY,
} from './lib/leads.js'

const WHATSAPP_CHAT_URL = 'https://wa.me/27630279893'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.18em] mb-5">{children}</p>
  )
}

/* ════════ THE REALITY (Pain) ════════ */
const SMALL_IMG = '/reality/photo-1.webp'
const LARGE_IMG = '/reality/photo-2.webp'
const SMALL_ALT = 'Small business owner reviewing their new Zanovo-built website on a laptop'
const LARGE_ALT = 'Zanovo team planning a digital growth and lead-generation strategy on a whiteboard'

export function PainSection() {
  return (
    <section className="bg-white pt-16 sm:pt-20 lg:pt-32 pb-12 sm:pb-16 lg:pb-24 overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="px-5 sm:px-8 lg:px-12">
          <SectionLabel>The reality</SectionLabel>
          <h2 className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 max-w-[820px] mb-12 sm:mb-16 lg:mb-24" style={{ fontSize: 'clamp(1.6rem, 4vw, 3.2rem)' }}>
            Great businesses are losing clients every day — not because of their service, but because of the gaps in
            their digital presence.
          </h2>
        </div>

        {/* Mobile / tablet stacked */}
        <div className="lg:hidden px-5 sm:px-8 lg:px-12">
          <p className="text-[15px] sm:text-[17px] leading-[1.65] font-medium text-gray-900">
            The gap between how good you are and how easy you are to find, reach, and engage — that's what costs you
            clients. We close that gap, and we stay to make sure it stays closed.
          </p>
          <div className="mt-6">
            <OrangeButton href="#services">How we close the gap</OrangeButton>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-5">
            <img src={SMALL_IMG} alt={SMALL_ALT} loading="lazy" className="sm:w-[45%] w-full aspect-[438/346] object-cover rounded-xl sm:rounded-2xl" />
            <img src={LARGE_IMG} alt={LARGE_ALT} loading="lazy" className="sm:w-[55%] w-full aspect-[900/600] object-cover rounded-xl sm:rounded-2xl" />
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid grid-cols-[26%_1fr_48%] items-end gap-6 xl:gap-8 px-12">
          <div className="self-end overflow-hidden rounded-2xl h-[300px]">
            <img src={SMALL_IMG} alt={SMALL_ALT} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="self-start flex flex-col items-end justify-end text-right">
            <p className="text-[16px] xl:text-[18px] leading-[1.65] font-medium text-gray-900 max-w-[360px]">
              The gap between how good you are and how easy you are to find, reach, and engage — that's what costs you
              clients. We close that gap, and we stay to make sure it stays closed.
            </p>
            <div className="mt-6">
              <OrangeButton href="#services">How we close the gap</OrangeButton>
            </div>
          </div>
          <div className="self-end overflow-hidden rounded-2xl h-[300px]">
            <img src={LARGE_IMG} alt={LARGE_ALT} loading="lazy" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════ SERVICES ════════ */
const services = [
  {
    Icon: Globe,
    title: 'Website Design & Build',
    body: 'A premium, conversion-optimised website that represents your business exactly as it deserves — professional, trustworthy, and built to turn visitors into paying clients. Delivered in 7 days, not months.',
    tag: 'Foundation',
    span: 2,
  },
  {
    Icon: Activity,
    title: 'SEO — Local, Technical & On-Page',
    body: 'Every kind of search optimisation your business needs: Google Business Profile and local rankings, technical fixes that let Google read your site properly, on-page content built around what your clients actually search for. Clear monthly ranking reports throughout.',
    tag: 'Visibility',
    span: 1,
  },
  {
    Icon: Megaphone,
    title: 'Meta & Google Ads',
    body: 'Paid campaigns on Facebook, Instagram and Google, managed end to end — audience research, creative, landing pages, and weekly optimisation. We report on what each campaign costs you and what it brings back, so the spend is always a decision rather than a guess.',
    tag: 'Paid growth',
    span: 2,
  },
  {
    Icon: Share2,
    title: 'Social Media Management',
    body: 'Your accounts, run properly: a monthly content plan, posts written and scheduled in your voice, and replies to the comments and DMs that turn into enquiries.',
    tag: 'Presence',
    span: 1,
  },
  {
    Icon: TrendingUp,
    title: 'Digital Marketing',
    body: 'Email campaigns, promotions and content that keep your business in front of past clients and warm leads — the people most likely to buy again.',
    tag: 'Demand',
    span: 1,
  },
  {
    Icon: Users,
    title: 'CRM & Lead Management',
    body: 'A single place where every enquiry lands, with automated follow-up behind it. You always know who came in, where they are in the conversation, and what to do next.',
    tag: 'Client acquisition',
    span: 1,
  },
  {
    Icon: HeartHandshake,
    title: 'Customer Success Management',
    body: 'Onboarding, check-ins and review requests handled on a schedule, so clients stay looked after long after the sale and refer you without being asked.',
    tag: 'Retention',
    span: 1,
  },
  {
    Icon: Workflow,
    title: 'AI & Agentic Workflows',
    body: 'The mundane, time-consuming work taken off your plate. AI agents that answer enquiries after hours, qualify leads, chase quotes and invoices, capture bookings, sort your inbox, and keep your records updated on their own. You spend your hours on the work only you can do.',
    tag: 'Automation',
    span: 2,
  },
  {
    Icon: Bot,
    title: 'Ongoing Growth Retainer',
    body: 'A dedicated growth partner who monitors performance, optimises your digital presence, and keeps your systems working as your business evolves. You grow — we do the work, month after month.',
    tag: 'Long-term partnership',
    span: 1,
  },
]

/* Optional add-ons — mirrors the checkout add-on list */
const addons = [
  { name: 'Brand Photography', desc: 'On-site shoot with 20–30 professionally edited photos for your site.' },
  { name: 'Website Copywriting', desc: 'Conversion-focused copy, professionally written for every page.' },
  { name: 'Logo Design', desc: 'Custom logo with 3 concepts and 2 rounds of revisions.' },
  { name: 'Social Media Setup', desc: 'Profile optimisation and branded templates for 2 platforms.' },
]

/* How many service cards mobile shows before "show more" */
const MOBILE_PREVIEW_COUNT = 3

export function ServicesSection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section id="services" className="bg-[#F5F5F5] py-20 lg:py-28">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionLabel>Services</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <h2 className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 max-w-[500px]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            Web design &amp; AI systems for small businesses.
          </h2>
          <p className="text-gray-600 max-w-[320px] text-[15px] leading-[1.75]">
            Every service we offer is scoped around a single objective: sustainable client acquisition and long-term
            business growth.
          </p>
        </div>

        {/* `auto-rows-fr` makes every row the same height, so a short card is never
           shorter than the tall one beside it — or the one in the row above. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:auto-rows-fr">
          {services.map(({ Icon, title, body, tag, span }, i) => (
            <div
              key={title}
              /* Every card stays in the DOM for search engines; on mobile the ones
                 past the third are hidden with CSS until "show more" is pressed. */
              className={`relative h-full overflow-hidden p-8 rounded-[18px] bg-white border border-gray-200 hover:border-[#FF6B00]/40 hover:-translate-y-1 transition-all duration-200 ${
                span === 2 ? 'md:col-span-2' : 'md:col-span-1'
              } ${!expanded && i >= MOBILE_PREVIEW_COUNT ? 'hidden md:block' : ''}`}
            >
              <div className="pointer-events-none absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(circle,rgba(255,107,0,0.07)_0%,transparent_70%)]" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B00]/[0.08] border border-[#FF6B00]/15 text-[#FF6B00] text-[12px] font-semibold mb-6">
                {tag}
              </span>
              <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 text-gray-900 flex items-center justify-center mb-5">
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <h3 className="text-[20px] font-semibold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-600 text-[15px] leading-[1.65]">{body}</p>
            </div>
          ))}
        </div>

        {/* Mobile only — desktop already shows all nine */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="md:hidden mt-6 w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white py-3.5 text-[14px] font-semibold text-gray-900 hover:border-gray-900 transition-colors"
        >
          {expanded ? 'Show fewer services' : `Show all ${services.length} services`}
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Optional add-ons — minimal text-only row */}
        <div className="mt-10 pt-10 border-t border-gray-200">
          <p className="text-[12px] font-semibold text-gray-500 uppercase tracking-[0.14em] mb-6">Optional add-ons</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            {addons.map(({ name, desc }) => (
              <div key={name}>
                <h4 className="text-[15px] font-semibold text-[#FF6B00]">{name}</h4>
                <p className="text-gray-600 text-[13px] leading-relaxed mt-1.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sends readers to How it works rather than straight to the form —
           they see the process before being asked for anything. */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <p className="text-gray-600 text-[15px] leading-[1.7]">
            Not sure which of these your business needs? Here is how we work it out together.
          </p>
          <OrangeButton href="#process">See how it works</OrangeButton>
        </div>
      </div>
    </section>
  )
}

/* ════════ ZANOVO CARE (small) ════════ */
const carePlans = [
  { name: 'Essential Care', desc: 'Hosting, backups, security monitoring and monthly updates.', tag: null as string | null },
  { name: 'Pro Care', desc: 'Everything in Essential, plus priority support and a monthly health check.', tag: 'Most popular' },
  { name: 'Premium Care', desc: 'Hands-off peace of mind, with ongoing strategy built in.', tag: null },
]

export function CareSection() {
  return (
    <section id="care" className="bg-white py-14 lg:py-20">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="rounded-2xl border border-gray-200 bg-[#F7F7F7] p-7 sm:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
            <div className="max-w-[560px]">
              <SectionLabel>Zanovo Care</SectionLabel>
              <h2 className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 mb-3" style={{ fontSize: 'clamp(22px, 3vw, 34px)' }}>
                Keep it running at its best.
              </h2>
              <p className="text-gray-600 text-[15px] leading-[1.7]">
                A live website is not a "set and forget" asset. Our ongoing care plans keep your site fast, secure, and up
                to date — month-to-month, cancel anytime.
              </p>
            </div>
            <Link to="/care" className="group inline-flex items-center gap-2 text-[14px] font-semibold text-[#FF6B00] shrink-0">
              Explore Zanovo Care
              <ArrowRight size={16} className={`transition-transform duration-500 ${EASE} group-hover:translate-x-1`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 border-t border-gray-200 pt-6">
            {carePlans.map(({ name, desc, tag }) => (
              <div key={name}>
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-[15px] font-semibold text-gray-900">{name}</h4>
                  {tag && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#FF6B00] bg-[#FF6B00]/[0.08] border border-[#FF6B00]/15 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ════════ HOW IT WORKS (Process) ════════ */
const steps = [
  {
    num: '01',
    title: 'Free Strategy Call',
    body: '30 minutes. We audit your current digital presence — website, search visibility, ads, social, and how enquiries reach you today — identify the specific gaps costing you clients, and deliver a clear growth plan. At no charge, with no obligation to proceed.',
  },
  {
    num: '02',
    title: 'We Scope Only What You Need',
    body: 'You do not buy all nine services. We recommend the few that move the needle for your business right now, in the order that makes sense, and we say so plainly when something can wait. Then we agree the scope before any work begins.',
  },
  {
    num: '03',
    title: 'We Build, Launch & Hand Over',
    body: 'Our team runs the delivery — a website live in 7 days, campaigns set up and tested, your CRM and automations wired in, your accounts handled. You get regular progress updates and a walkthrough of everything once it is running.',
  },
  {
    num: '04',
    title: 'We Grow Together',
    body: 'This is where the real relationship begins. Monthly performance reviews across everything we run for you, ongoing optimisation, and a team genuinely invested in your outcomes — not just at launch, but for the long term.',
  },
]

export function ProcessSection() {
  return (
    <section id="process" className="bg-white py-20 lg:py-28">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
        <SectionLabel>How it works</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <h2 className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 max-w-[460px]" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            From invisible to unstoppable — whichever services you need.
          </h2>
          <a href="#contact" className="group flex items-center gap-2 text-[14px] font-semibold text-[#FF6B00]">
            Start today
            <ArrowRight size={16} className={`transition-transform duration-500 ${EASE} group-hover:translate-x-1`} />
          </a>
        </div>

        <div className="flex flex-col">
          {steps.map(({ num, title, body }, i) => (
            <div
              key={num}
              className={`grid grid-cols-[56px_1fr] sm:grid-cols-[80px_1fr] gap-6 sm:gap-8 py-9 ${
                i < steps.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="text-[13px] font-bold text-[#FF6B00] tracking-[0.05em] pt-1">{num}</div>
              <div>
                <h3 className="text-[22px] font-semibold text-gray-900 mb-2.5">{title}</h3>
                <p className="text-gray-600 text-[16px] leading-[1.65] max-w-[560px]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ════════ CONTACT ════════ */
const includes = [
  'A full audit of your website and Google presence',
  'Clear identification of your key client acquisition gaps',
  'Honest recommendations — even if that means a smaller engagement',
]

const formFields = [
  { key: 'name', label: 'Full name', type: 'text', placeholder: 'Your name' },
  { key: 'business', label: 'Business name', type: 'text', placeholder: 'Your business' },
  { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
]

const fieldCls =
  'w-full rounded-[10px] border border-gray-300 bg-white px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#FF6B00] transition-colors'

export function ContactSection() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    loadRecaptcha()
  }, [])

  const handleChange =
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const limit = (FIELD_LIMITS as Record<string, number>)[key]
      let value = e.target.value
      if (key === 'phone') value = value.replace(/[^\d\s()+-]/g, '')
      if (limit) value = value.slice(0, limit)
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const lead = normalizeLead(form)
    const validationError = validateLead(lead)
    if (validationError) {
      setErrorMsg(validationError)
      setStatus('error')
      return
    }

    const phoneE164 = nationalToE164(lead.phone, lead.phoneCountry) ?? lead.phone
    const recaptchaToken = await getRecaptchaToken('submit_lead')
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      setErrorMsg("Security check didn't load. Please refresh the page and try again, or email us at thabiso@zanovo.co.za")
      setStatus('error')
      return
    }

    try {
      const response = await fetch(getLeadFunctionUrl(), {
        method: 'POST',
        headers: getSupabaseFunctionHeaders(),
        body: JSON.stringify({
          name: lead.name,
          business: lead.business,
          email: lead.email,
          phone: phoneE164,
          message: lead.message || null,
          recaptchaToken,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const serverMsg = payload.error || payload.message || payload.msg
        throw new Error(serverMsg || `Lead function returned ${response.status}`)
      }
      setForm(EMPTY_FORM)
      setStatus('success')
    } catch (err) {
      const fallback = 'Something went wrong. Please try again, or email us directly at thabiso@zanovo.co.za'
      const msg = err instanceof Error ? err.message : ''
      const safe = msg && !msg.includes('Lead function returned') && !msg.toLowerCase().includes('failed to fetch') && !msg.toLowerCase().includes('network')
      setErrorMsg(safe ? msg : fallback)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="bg-[#F5F5F5] py-20 lg:py-28">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-[#FF6B00]/20 bg-gradient-to-br from-[#FF6B00]/[0.08] to-[#FF6B00]/[0.03] p-7 sm:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(255,107,0,0.12)_0%,transparent_70%)]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left */}
            <div>
              <SectionLabel>Let's talk</SectionLabel>
              <h2 className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 mb-5" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                Not just a website agency.{' '}
                <span className="text-[#FF6B00] italic">A growth partner.</span>
              </h2>
              <p className="text-gray-600 text-[16px] leading-[1.85] mb-9">
                We audit your current digital presence, identify the specific gaps affecting your client acquisition, and
                deliver a concrete plan to address them. No pitch, no pressure — just an honest conversation about what's
                possible for your business.
              </p>
              <div className="text-[11px] font-semibold tracking-[0.14em] text-gray-500 uppercase mb-4">What to expect</div>
              <div className="flex flex-col gap-3.5">
                {includes.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Check size={18} className="text-[#16a34a] shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-[15px] text-gray-900 leading-[1.6]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              {/* Honeypot — hidden from users */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange('website')}
                className="hidden"
                aria-hidden="true"
              />

              {formFields.map(({ key, label, type, placeholder }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-gray-600">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required
                    maxLength={(FIELD_LIMITS as Record<string, number>)[key]}
                    value={(form as Record<string, string>)[key]}
                    onChange={handleChange(key)}
                    className={fieldCls}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-600">Phone number</label>
                <div className="flex flex-wrap gap-2.5">
                  <select
                    value={form.phoneCountry}
                    required
                    aria-label="Country calling code"
                    onChange={(e) => setForm((prev) => ({ ...prev, phoneCountry: e.target.value }))}
                    className={`${fieldCls} cursor-pointer max-w-[240px]`}
                  >
                    {PHONE_COUNTRY_OPTIONS.map(({ iso, dial, label }) => (
                      <option key={iso} value={iso}>+{dial} {label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="National number"
                    required
                    maxLength={FIELD_LIMITS.phone}
                    value={form.phone}
                    onChange={handleChange('phone')}
                    className={`${fieldCls} flex-1 min-w-[140px]`}
                  />
                </div>
                <p className="text-[12px] text-gray-500 leading-[1.5]">
                  Choose your country code, then enter your number as you would dial it locally (with area code if you
                  normally include it). We check the digit length for the country you selected.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-600">Tell us about your business</label>
                <textarea
                  rows={3}
                  placeholder="What does your business do and what is your biggest challenge right now?"
                  maxLength={FIELD_LIMITS.message}
                  value={form.message}
                  onChange={handleChange('message')}
                  className={`${fieldCls} resize-y`}
                />
              </div>

              {status === 'success' && (
                <div className="rounded-[10px] bg-[#16a34a]/10 border border-[#16a34a]/25 text-[#15803d] text-[14px] leading-relaxed px-3.5 py-3">
                  Thanks. Your details have been received, and we'll be in touch within one business day.
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-[14px] leading-relaxed px-3.5 py-3">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-1 w-full flex items-center justify-center gap-2 rounded-full bg-[#FF6B00] hover:bg-[#CC4A00] disabled:opacity-70 text-white py-3.5 text-[14px] font-medium transition-colors"
              >
                {status === 'loading' ? 'Sending…' : <>Book my free strategy call <ArrowRight size={16} /></>}
              </button>
              <p className="text-[12px] text-gray-500 text-center leading-[1.6]">
                No commitment required. We respond within one business day to confirm your call time.
              </p>
              <p className="text-[11px] text-gray-400 text-center leading-[1.6]">
                Protected by reCAPTCHA — Google's{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms</a> apply.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="h-px bg-gray-300 flex-1" />
                <span className="text-[12px] text-gray-500">or</span>
                <div className="h-px bg-gray-300 flex-1" />
              </div>

              {/* WhatsApp CTA */}
              <a
                href={WHATSAPP_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault()
                  try {
                    notifyWhatsAppClick()
                  } catch {
                    /* tracking is best-effort — never block the chat */
                  }
                  window.open(WHATSAPP_CHAT_URL, '_blank', 'noopener,noreferrer')
                }}
                className="flex items-center justify-center gap-2.5 rounded-[10px] py-3 bg-[#25D366]/10 border border-[#25D366]/25 text-[#1ca350] font-semibold text-[14px] hover:bg-[#25D366]/15 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat to us on WhatsApp
              </a>

              {/* Call CTA */}
              <a
                href="tel:+27630279893"
                className="flex items-center justify-center gap-2 rounded-[10px] py-3 bg-white border border-gray-300 text-gray-600 font-medium text-[14px] hover:border-gray-400 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Call us: +27 63 027 9893
              </a>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
