import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@glyph-weaver/ui'
import { ServiceWorkerRegister } from './service-worker-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'Glyph Weaver - Spell Crafting Studio',
  description:
    'Draw glyph rings and craft magic spells in this interactive tool inspired by the Witch Hat Atelier magic system.',
  applicationName: 'Glyph Weaver',
  appleWebApp: {
    capable: true,
    title: 'Glyph Weaver',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/192', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/icons/192', type: 'image/png', sizes: '192x192' }],
  },
}

// Next 15 requires the viewport to be its own export, not a metadata field.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#1a1423',
  colorScheme: 'dark light',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('glyph-weaver-locale')?.value
  const acceptLanguage = (await headers()).get('accept-language') ?? undefined
  const locale = resolveLocale(localeCookie, acceptLanguage)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-w-[320px] antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
