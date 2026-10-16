import { Navbar, Footer } from './site'
import { C } from './legalStyles'

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#EFEFEF] min-h-screen" style={{ color: C.text }}>
      <Navbar />
      <article style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>{children}</article>
      <Footer />
    </div>
  )
}
