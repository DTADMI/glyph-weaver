import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@glyph-weaver/ui'
import './globals.css'

export const metadata: Metadata = {
  title: 'Glyph Weaver — Spell Crafting Studio',
  description:
    'Draw glyph rings and craft magic spells in this interactive tool inspired by the Witch Hat Atelier magic system.',
  viewport: 'width=device-width, initial-scale=1, minimum-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('glyph-weaver-locale')?.value
  const acceptLanguage = (await headers()).get('accept-language') ?? undefined
  const locale = resolveLocale(localeCookie, acceptLanguage)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1a1423" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-w-[320px] antialiased">{children}</body>
    </html>
  )
}
