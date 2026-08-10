import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'

/* Zanovo brand tokens (kept from the existing site) */
export const ORANGE = '#FF6B00'
export const EASE = 'ease-[cubic-bezier(0.25,0.1,0.25,1)]'
export const CONTACT_EMAIL = 'thabiso@zanovo.co.za'

/* ── Rolling-text label: duplicated copy that rolls up on group hover ── */
export function TextRoll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`overflow-hidden h-[20px] inline-flex flex-col ${className}`}>
      <span className={`flex flex-col transition-transform duration-500 ${EASE} group-hover:-translate-y-1/2`}>
        <span className="h-[20px] flex items-center whitespace-nowrap">{children}</span>
        <span className="h-[20px] flex items-center whitespace-nowrap">{children}</span>
      </span>
    </span>
  )
}

/* Orange pill button with rolling text + rotating arrow */
export function OrangeButton({ children, to, href }: { children: React.ReactNode; to?: string; href?: string }) {
  const inner = (
    <span className="group inline-flex items-center gap-3 bg-[#FF6B00] hover:bg-[#CC4A00] transition-colors text-white text-[13px] sm:text-[14px] rounded-full pl-5 sm:pl-6 pr-2 py-2">
      <TextRoll>{children}</TextRoll>
      <span className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shrink-0">
        <ArrowRight size={15} className={`text-[#FF6B00] transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
      </span>
    </span>
  )
  if (to) return <Link to={to}>{inner}</Link>
  return <a href={href}>{inner}</a>
}

type NavItem = { label: string; to?: string; hash?: string }
const NAV_ITEMS: NavItem[] = [
  { label: 'Services', hash: 'services' },
  { label: 'Process', hash: 'process' },
  { label: 'Care', to: '/care' },
  { label: 'Contact', hash: 'contact' },
]

/* Routes a nav item: page links navigate; hash links smooth-scroll on home,
   or route home + anchor from another page. */
function useGoTo() {
  const navigate = useNavigate()
  const location = useLocation()
  return (item: NavItem, after?: () => void) => {
    if (item.to) {
      navigate(item.to)
    } else if (item.hash) {
      if (location.pathname === '/') {
        document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate(`/#${item.hash}`)
      }
    }
    after?.()
  }
}

function NavLink({ item, onClick, className }: { item: NavItem; onClick?: () => void; className?: string }) {
  const go = useGoTo()
  const cls = className ?? 'text-[14px] text-gray-900 hover:text-gray-500 transition-colors duration-300'
  return (
    <button onClick={() => go(item, onClick)} className={cls}>
      {item.label}
    </button>
  )
}

/* ── Shared navigation (pill navbar + mobile sheet) ── */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const go = useGoTo()

  return (
    <>
      <div className="relative z-20 w-full max-w-[1440px] mx-auto p-2 sm:p-3">
        <nav className="bg-white rounded-full flex items-center justify-between p-[5px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {/* Left: logo + links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0A0D12] rounded-full flex items-center justify-center overflow-hidden shrink-0"
            >
              <img src="/zanovo-submark-transparent.png" alt="Zanovo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.label} item={item} />
              ))}
            </div>
          </div>

          {/* Right: CTA (desktop) */}
          <div className="hidden md:flex items-center gap-5 pr-1">
            <button
              onClick={() => go({ label: 'Contact', hash: 'contact' })}
              className="group flex items-center gap-2 bg-[#0A0D12] text-white text-[13px] font-medium rounded-full pl-5 pr-2 py-2"
            >
              <TextRoll>Get Started</TextRoll>
              <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
                <ArrowRight size={14} className={`text-[#0A0D12] transition-transform duration-500 ${EASE} group-hover:-rotate-45`} />
              </span>
            </button>
          </div>

          {/* Mobile: menu toggle */}
          <div className="md:hidden flex items-center gap-2 mr-1">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-2 bg-[#0A0D12] text-white text-[13px] font-medium rounded-full pl-4 pr-4 py-2"
            >
              <Menu size={16} />
              <span>Menu</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <div className={`fixed inset-0 z-50 md:hidden ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 bg-white rounded-2xl mx-3 mb-3 p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            menuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-[15px] font-semibold tracking-tight text-gray-900">Zanovo</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 bg-[#0A0D12] text-white rounded-full flex items-center justify-center"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex flex-col gap-1 mb-8">
            {NAV_ITEMS.map((item) => (
              <span key={item.label} className="text-[28px] leading-[40px] font-medium text-gray-900">
                <NavLink item={item} onClick={() => setMenuOpen(false)} />
              </span>
            ))}
          </div>
          <button
            onClick={() => go({ label: 'Contact', hash: 'contact' }, () => setMenuOpen(false))}
            className="group w-full flex items-center justify-between bg-[#FF6B00] text-white text-[15px] font-medium rounded-full pl-6 pr-2 py-3"
          >
            <span>Get Started</span>
            <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <ArrowRight size={16} className="text-[#FF6B00]" />
            </span>
          </button>
        </div>
      </div>
    </>
  )
}

/* ── Shared footer ── */
export function Footer() {
  const year = new Date().getFullYear()
  const links = [
    { to: '/terms', label: 'Terms of service' },
    { to: '/privacy', label: 'Privacy policy' },
    { to: '/refund', label: 'Refund policy' },
  ]
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="w-9 h-9 bg-[#0A0D12] rounded-full flex items-center justify-center overflow-hidden">
            <img src="/zanovo-submark-transparent.png" alt="Zanovo" className="w-6 h-6 object-contain" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">Zanovo</span>
        </Link>
      </div>

      {/* Legal links sit on the same line as the copyright */}
      <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-10 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] text-gray-500">© {year} Zanovo (Pty) Ltd. All rights reserved.</p>

        <div className="flex flex-wrap items-center gap-2.5">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-[13px] font-medium text-gray-600 hover:text-[#FF6B00] transition-colors px-1.5 py-1"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
