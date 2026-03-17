import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ── PostHog initialisation ────────────────────────────────
// Reads VITE_POSTHOG_KEY from environment (set in Vercel)
const PH_KEY = import.meta.env.VITE_POSTHOG_KEY
if (PH_KEY) {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(PH_KEY, {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      autocapture: true,
    })
    window.posthog = posthog
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
