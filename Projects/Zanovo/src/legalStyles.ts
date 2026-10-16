import type { CSSProperties } from 'react'

/* Light-theme typographic styles shared by the policy pages */
export const C = { accent: '#FF6B00', text: '#0A0D12', muted: '#4B5563', border: '#E5E7EB' }

export const sectionTitle: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: '1.05rem',
  fontWeight: 700,
  color: C.text,
  marginTop: 32,
  marginBottom: 12,
}
export const subTitle: CSSProperties = { ...sectionTitle, fontSize: '0.92rem', marginTop: 20, marginBottom: 8 }
export const body: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 15,
  lineHeight: 1.75,
  color: C.muted,
  margin: '0 0 12px',
}
export const list: CSSProperties = { ...body, paddingLeft: 22, marginBottom: 16 }
export const h1Style: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  margin: '0 0 12px',
  color: C.text,
}
export const asideStyle: CSSProperties = {
  padding: '16px 18px',
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  background: '#ffffff',
  marginBottom: 28,
}
