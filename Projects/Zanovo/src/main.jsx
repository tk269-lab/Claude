import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './AppRoutes.jsx'
import { initErrorLogging, getStoredErrors } from './lib/errorLogging.js'

// Capture uncaught errors + promise rejections (visible in production too)
initErrorLogging()
// Lets you inspect recent client errors from the browser console
if (typeof window !== 'undefined') {
  window.__zanovoErrors = getStoredErrors
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
