'use client'

import { ThemeProvider } from '@glyph-weaver/ui'
import { I18nProvider } from '@glyph-weaver/ui'
import { GlyphWeaverShell } from '@glyph-weaver/ui'

export default function HomePage() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <GlyphWeaverShell />
      </I18nProvider>
    </ThemeProvider>
  )
}
