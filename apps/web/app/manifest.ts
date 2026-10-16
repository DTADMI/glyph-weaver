import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Glyph Weaver - Spell Crafting Studio',
    short_name: 'Glyph Weaver',
    description:
      'Draw glyph rings and craft magic spells in this interactive tool inspired by the Witch Hat Atelier magic system.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#1a1423',
    theme_color: '#1a1423',
    icons: [
      { src: '/icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // A maskable icon lets Android crop the ring into its own shape without
      // cutting the glyph: the artwork keeps a safe margin of background.
      { src: '/icons/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
