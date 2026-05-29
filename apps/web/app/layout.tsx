import type { Metadata } from 'next'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1a1423" />
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-w-[320px] antialiased">{children}</body>
    </html>
  )
}
