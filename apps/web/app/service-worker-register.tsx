'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker in production only.
 *
 * In development the worker would cache the dev server's assets and make hot
 * reload behave strangely, so it is skipped there. Failure is silent on
 * purpose: offline support is a bonus, never a reason the studio fails to load.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const register = () => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support stays unavailable; the app keeps working online.
      })
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
