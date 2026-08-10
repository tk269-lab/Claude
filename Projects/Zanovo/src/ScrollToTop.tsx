import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-[72px] right-4 z-50 w-12 h-12 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform duration-150 focus:outline-none"
      style={{ rotate: '180deg' }}
    >
      <img
        src="/zanovo-submark-transparent.png"
        alt=""
        className="w-full h-full rounded-full"
        draggable={false}
      />
    </button>
  )
}
