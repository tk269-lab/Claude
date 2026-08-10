import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react'
import { Navbar, Footer, OrangeButton, ORANGE } from './site'
import { PainSection, ServicesSection, CareSection, ProcessSection, ContactSection } from './homeSections'

/* The animated hero renders through WebGPU (Safari 18.2+, Chrome 121+). Older
   browsers — still common on Android and older iPhones — have no navigator.gpu,
   where the shader would throw on every frame. Those visitors get a static
   painted gradient in the same palette instead. */
function useSupportsShader() {
  // Truthiness, not `'gpu' in navigator` — some browsers expose the key while
  // leaving it undefined, and a disabled/absent adapter must take the fallback.
  return useState(() => typeof navigator !== 'undefined' && Boolean((navigator as Navigator & { gpu?: unknown }).gpu))[0]
}

/* Static stand-in: the swirl's light base with the orange chroma bloom baked in. */
function StaticHeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(120% 90% at 78% 18%, rgba(255,107,0,0.16) 0%, rgba(255,107,0,0) 55%),
          radial-gradient(90% 70% at 12% 78%, rgba(255,107,0,0.10) 0%, rgba(255,107,0,0) 60%),
          linear-gradient(140deg, #ffffff 0%, #f4f4f4 45%, #ededed 100%)
        `,
      }}
    />
  )
}

export default function Home() {
  const location = useLocation()
  const supportsShader = useSupportsShader()

  useEffect(() => {
    document.title = 'Zanovo — Growth systems for ambitious brands'
  }, [])

  // Scroll to a section when arriving with a hash (e.g. /#contact from another page)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const t = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 80)
      return () => clearTimeout(t)
    }
  }, [location.hash])

  return (
    <div className="bg-white text-gray-900">
      {/* ════════ HERO ════════ */}
      <section className="relative min-h-screen w-full flex flex-col bg-[#EFEFEF] overflow-hidden">
        <div className="absolute inset-0 z-10 pointer-events-none">
          {supportsShader ? (
            <Shader style={{ width: '100%', height: '100%' }}>
              <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
              <ChromaFlow baseColor="#ffffff" downColor={ORANGE} leftColor={ORANGE} rightColor={ORANGE} upColor={ORANGE} momentum={13} radius={3.5} />
              <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
              <FilmGrain strength={0.05} />
            </Shader>
          ) : (
            <StaticHeroBackdrop />
          )}
        </div>

        <Navbar />

        <div className="flex-1" />
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-16 lg:pb-20">
          <p className="text-[17px] sm:text-[19px] font-semibold text-[#FF6B00] tracking-[0.12em] uppercase mb-5 sm:mb-8">Zanovo</p>
          <h1 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900" style={{ fontSize: 'clamp(1.75rem, 7vw, 4.2rem)' }}>
            We build the growth engines
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            for brands ready to dominate
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            their category at scale.
          </h1>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <OrangeButton href="#contact">Start scaling</OrangeButton>
          </div>

          {/* WhatsApp link — text only */}
          <a
            href="https://wa.me/27630279893"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[14px] font-medium text-[#1ca350] hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat to us on WhatsApp
          </a>
        </div>
      </section>

      {/* ════════ REAL ZANOVO SECTIONS ════════ */}
      <PainSection />
      <ServicesSection />
      <CareSection />
      <ProcessSection />
      <ContactSection />

      <Footer />
    </div>
  )
}
