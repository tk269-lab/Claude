import { useEffect } from 'react'
import { Check, ShieldCheck, Gauge, LifeBuoy } from 'lucide-react'
import { Navbar, Footer, OrangeButton } from './site'
import { ContactSection } from './homeSections'
import { CARE_PLANS } from './lib/plans.js'

/* Zanovo Care — public service page. Deliberately shows what each plan covers
   but not what it costs: pricing goes out as a private /plans link (2026-08-10
   decision). The contact form at the bottom is the conversion path. */

type CarePlan = {
  slug: string
  name: string
  tag: string | null
  description: string
  features: string[]
  featured: boolean
}

const reasons = [
  {
    Icon: ShieldCheck,
    title: 'Security is not optional',
    body: 'Outdated software is the most common way small business websites get defaced or taken offline. We patch, monitor and back up so a bad week never becomes a lost website.',
  },
  {
    Icon: Gauge,
    title: 'Speed decays quietly',
    body: 'Sites get slower as content and plugins pile up, and a slow site quietly costs you enquiries. We keep an eye on performance rather than waiting for you to notice.',
  },
  {
    Icon: LifeBuoy,
    title: 'You should not have to do it',
    body: 'Editing a page, adding a service, swapping a photo — send it to us. You booked a website to win clients, not to become its administrator.',
  },
]

export default function CarePage() {
  useEffect(() => {
    document.title = 'Zanovo Care — Website Maintenance & Support | Zanovo'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'Zanovo — Growth systems for ambitious brands'
    }
  }, [])

  return (
    <div className="bg-white text-gray-900">
      {/* ── Hero ── */}
      <section className="bg-[#EFEFEF]">
        <Navbar />
        <div className="w-full max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 sm:pt-20 lg:pt-24 pb-16 lg:pb-20">
          <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.18em] mb-5">Zanovo Care</p>
          <h1
            className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 max-w-[820px]"
            style={{ fontSize: 'clamp(30px, 6vw, 60px)' }}
          >
            Keep it running at its best.
          </h1>
          <p className="mt-6 text-[16px] sm:text-[18px] text-gray-600 leading-[1.8] max-w-[640px]">
            A live website is not a &ldquo;set and forget&rdquo; asset. Zanovo Care keeps your site fast, secure and up to
            date — and puts a person on the other end when you need something changed. Month-to-month, cancel anytime.
          </p>
          <div className="mt-9">
            <OrangeButton href="#contact">Talk to us about care</OrangeButton>
          </div>
        </div>
      </section>

      {/* ── Why care ── */}
      <section className="bg-white py-20 lg:py-24">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {reasons.map(({ Icon, title, body }) => (
              <div key={title}>
                <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 text-gray-900 flex items-center justify-center mb-5">
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3 className="text-[19px] font-semibold text-gray-900 mb-2.5">{title}</h3>
                <p className="text-gray-600 text-[15px] leading-[1.7]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans (what is covered, not what it costs) ── */}
      <section className="bg-[#F5F5F5] py-20 lg:py-28">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-[620px] mx-auto mb-14">
            <p className="text-[12px] font-semibold text-[#FF6B00] uppercase tracking-[0.18em] mb-5">The plans</p>
            <h2
              className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900 mb-4"
              style={{ fontSize: 'clamp(26px, 4vw, 42px)' }}
            >
              Three levels of looking after it.
            </h2>
            <p className="text-[16px] text-gray-600 leading-[1.8]">
              Every plan covers the essentials. The difference is how much of the ongoing work — edits, reporting and
              strategy — you hand over to us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {(CARE_PLANS as CarePlan[]).map((p) => (
              <div
                key={p.slug}
                className={`rounded-2xl overflow-hidden bg-white ${
                  p.featured
                    ? 'border-2 border-[#FF6B00] shadow-[0_8px_30px_rgba(255,107,0,0.12)]'
                    : 'border border-gray-200'
                }`}
              >
                {p.tag && (
                  <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-[12px] font-bold uppercase tracking-wider text-center py-2">
                    {p.tag}
                  </div>
                )}
                <div className="p-7">
                  <h3 className={`text-[19px] font-semibold mb-3 ${p.featured ? 'text-[#FF6B00]' : 'text-gray-900'}`}>
                    {p.name}
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed mb-6">{p.description}</p>
                  <div className="h-px bg-gray-200 mb-5" />
                  <div className="flex flex-col gap-3 mb-7">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check
                          size={16}
                          className={`shrink-0 mt-0.5 ${p.featured ? 'text-[#FF6B00]' : 'text-[#16a34a]'}`}
                          strokeWidth={2.5}
                        />
                        <span className="text-[13px] leading-snug text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#contact"
                    className={`w-full inline-flex items-center justify-center rounded-full py-3 text-[14px] font-medium transition-colors ${
                      p.featured
                        ? 'bg-[#FF6B00] hover:bg-[#CC4A00] text-white'
                        : 'border border-gray-300 hover:border-gray-900 text-gray-900'
                    }`}
                  >
                    Enquire about {p.name}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[14px] text-gray-600 leading-relaxed mt-10 max-w-[720px] mx-auto">
            Care plans are matched to your site on a short call — how big it is, how often it changes, and how hands-on
            you want to be. Already a Zanovo client? Care can be added to your build at any time.
          </p>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  )
}
