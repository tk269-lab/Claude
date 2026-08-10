import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, ArrowRight, X, Plus } from 'lucide-react'
import { Navbar, Footer, EASE } from './site'
import { ADD_ONS, formatRand } from './lib/addons.js'
import { PLANS as plans, CARE_PLANS as carePlans } from './lib/plans.js'

type PlanLite = { slug: string; name: string; setupCents: number }

/* Add-ons selection popup shown after a client picks a pack */
function AddOnsModal({ plan, onClose }: { plan: PlanLite; onClose: () => void }) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const setupCents = plan.setupCents
  const addonsCents = selected.reduce((sum, id) => sum + (ADD_ONS.find((a: { id: string; cents: number }) => a.id === id)?.cents ?? 0), 0)
  const total = setupCents + addonsCents

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const goToCheckout = () => {
    const q = selected.length ? `?plan=${plan.slug}&addons=${selected.join(',')}` : `?plan=${plan.slug}`
    navigate(`/checkout${q}`)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Customise your ${plan.name}`}
        className="relative w-full sm:max-w-[560px] max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.16em] mb-1">{plan.name}</p>
            <h3 className="text-[19px] font-semibold text-gray-900">Add anything else you need</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0">
            <X size={18} className="text-gray-700" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          <p className="text-[14px] text-gray-600 leading-relaxed mb-1">
            Optional extras you can bundle with your setup. Skip any you don&rsquo;t need — you can always add them later.
          </p>
          {ADD_ONS.map((a) => {
            const on = selected.includes(a.id)
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                aria-pressed={on}
                className={`text-left rounded-[12px] border p-4 flex items-start gap-3 transition-colors ${
                  on ? 'border-[#FF6B00] bg-[#FF6B00]/[0.05]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${on ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-300'}`}>
                  {on ? <Check size={13} className="text-white" /> : <Plus size={13} className="text-gray-400" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[14px] font-semibold text-gray-900">{a.name}</span>
                    <span className="text-[13px] font-medium text-[#FF6B00] whitespace-nowrap">{formatRand(a.cents)}</span>
                  </span>
                  <span className="block text-[12px] text-gray-600 leading-relaxed mt-1">{a.desc}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-gray-500">Setup total today</span>
            <span className="text-[18px] font-bold text-gray-900">{formatRand(total)}</span>
          </div>
          <button
            onClick={goToCheckout}
            className="group w-full flex items-center justify-center gap-2 rounded-full bg-[#FF6B00] hover:bg-[#CC4A00] text-white py-3 text-[14px] font-medium transition-colors"
          >
            Continue to checkout
            <ArrowRight size={15} className={`transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Feature({ text, featured }: { text: string; featured: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Check size={16} className={`shrink-0 mt-0.5 ${featured ? 'text-[#FF6B00]' : 'text-[#16a34a]'}`} />
      <span className="text-[13px] leading-snug text-gray-600">{text}</span>
    </div>
  )
}

function CtaButton({ featured, children, to, href, onClick }: { featured: boolean; children: React.ReactNode; to?: string; href?: string; onClick?: () => void }) {
  const base = featured
    ? 'group bg-[#FF6B00] hover:bg-[#CC4A00] text-white'
    : 'border border-gray-300 hover:border-gray-900 text-gray-900'
  const cls = `w-full flex items-center justify-center gap-2 rounded-full py-3 text-[14px] font-medium transition-colors ${base}`
  const content = (
    <>
      {children}
      {featured && <ArrowRight size={15} className={`transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />}
    </>
  )
  if (onClick) return <button onClick={onClick} className={cls}>{content}</button>
  if (to) return <Link to={to} className={cls}>{content}</Link>
  return <a href={href} className={cls}>{content}</a>
}

/* Shareable pricing link (zanovo.co.za/plans). Not linked from the site nav —
   TK sends this to a client directly, and they can pay from here. Kept out of
   search results so pricing stays a conversation, not a public page. */
export default function PlansPage() {
  const [modalPlan, setModalPlan] = useState<PlanLite | null>(null)

  useEffect(() => {
    document.title = 'Your Plan & Pricing | Zanovo'
    window.scrollTo(0, 0)

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.title = 'Zanovo — Growth systems for ambitious brands'
      meta.remove()
    }
  }, [])

  return (
    <div className="bg-[#EFEFEF] min-h-screen text-gray-900">
      {modalPlan && <AddOnsModal plan={modalPlan} onClose={() => setModalPlan(null)} />}
      <Navbar />

      {/* ── Pricing ── */}
      <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 lg:pt-24 pb-10">
        <div className="text-center max-w-[660px] mx-auto mb-12 sm:mb-16">
          <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.18em] mb-5">Investment</p>
          <h1 className="font-medium leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
            More booked jobs. Fewer missed calls. Leads that follow themselves up.
          </h1>
          <p className="text-[16px] sm:text-[17px] text-gray-600 leading-[1.8]">
            The real cost isn&rsquo;t the package — it&rsquo;s the leads slipping through every week: missed WhatsApps,
            unanswered enquiries, reviews you never asked for. Zanovo plugs the gaps. Cancel anytime. Keep your domain.
            Own your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((p) => (
            <div
              key={p.slug}
              className={`rounded-2xl overflow-hidden bg-white ${
                p.featured ? 'border-2 border-[#FF6B00] shadow-[0_8px_30px_rgba(255,107,0,0.12)]' : 'border border-gray-200'
              }`}
            >
              {p.tag && (
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-[12px] font-bold uppercase tracking-wider text-center py-2">
                  {p.tag}
                </div>
              )}
              <div className="p-7">
                <h3 className={`text-[19px] font-semibold mb-5 ${p.featured ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{p.name}</h3>

                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <div className="rounded-[10px] border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="text-[11px] text-gray-500 font-medium mb-1.5">Once-off setup</div>
                    <div className="text-[18px] font-bold tracking-tight text-gray-900">{p.setupDisplay}</div>
                  </div>
                  <div className={`rounded-[10px] px-4 py-3 ${p.featured ? 'border border-[#FF6B00]/30 bg-[#FF6B00]/[0.06]' : 'border border-gray-200 bg-gray-50'}`}>
                    <div className="text-[11px] text-gray-500 font-medium mb-1.5">Monthly retainer</div>
                    <div>
                      <span className={`text-[18px] font-bold tracking-tight ${p.featured ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{p.monthlyDisplay}</span>
                      <span className="text-[11px] text-gray-500 ml-1">/mo</span>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">{p.description}</p>
                <div className="h-px bg-gray-200 mb-5" />

                <div className="flex flex-col gap-3 mb-7">
                  {p.features.map((f) => (
                    <Feature key={f} text={f} featured={p.featured} />
                  ))}
                </div>

                <CtaButton featured={p.featured} onClick={() => setModalPlan({ slug: p.slug, name: p.name, setupCents: p.setupCents })}>{p.cta}</CtaButton>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[14px] text-gray-600 leading-relaxed mt-8 max-w-[760px] mx-auto">
          If the set packages do not work for your business, we can build a custom package around exactly what you need.
          Book a free strategy call — the recommendation is always honest, even if it means a smaller package.
        </p>
      </section>

      {/* ── Zanovo Care ── */}
      <section className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-20 lg:pb-28">
        <div className="text-center max-w-[600px] mx-auto mb-12">
          <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.18em] mb-5">Zanovo Care</p>
          <h2 className="font-medium leading-[1.1] tracking-[-0.02em] mb-4" style={{ fontSize: 'clamp(26px, 4vw, 42px)' }}>
            Keep it running at its best.
          </h2>
          <p className="text-[16px] sm:text-[17px] text-gray-600 leading-[1.8]">
            A live website is not a "set and forget" asset. Our ongoing care plans keep your site fast, secure, and up to
            date — so it keeps working long after launch. Month-to-month, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {carePlans.map((p) => (
            <div
              key={p.slug}
              className={`rounded-2xl overflow-hidden bg-white ${
                p.featured ? 'border-2 border-[#FF6B00] shadow-[0_8px_30px_rgba(255,107,0,0.12)]' : 'border border-gray-200'
              }`}
            >
              {p.tag && (
                <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-[12px] font-bold uppercase tracking-wider text-center py-2">
                  {p.tag}
                </div>
              )}
              <div className="p-7">
                <h3 className={`text-[19px] font-semibold mb-4 ${p.featured ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{p.name}</h3>
                <div className="mb-5">
                  <span className={`text-[32px] font-bold tracking-tight ${p.featured ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{p.monthlyDisplay}</span>
                  <span className="text-[13px] text-gray-500 ml-1">/ month</span>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-6">{p.description}</p>
                <div className="h-px bg-gray-200 mb-5" />
                <div className="flex flex-col gap-3 mb-7">
                  {p.features.map((f) => (
                    <Feature key={f} text={f} featured={p.featured} />
                  ))}
                </div>
                <CtaButton featured={p.featured} to={`/checkout?plan=${p.slug}`}>Get Started</CtaButton>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[14px] text-gray-600 leading-relaxed mt-8 max-w-[760px] mx-auto">
          Care plans are tailored on a quick call to match your site and how hands-on you want to be. Already a Zanovo
          client? Care can be added to your build at any time.
        </p>
      </section>

      <Footer />
    </div>
  )
}
