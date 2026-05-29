import type { GlyphAST, RecognizedSigil } from '@glyph-weaver/core'

export interface SigilExtractionResult {
  sigil: RecognizedSigil | null
  hadMultiple: boolean
}

export function extractPrimarySigil(ast: GlyphAST): SigilExtractionResult {
  const { primarySigil, unsupportedMultipleSigils } = ast

  if (!primarySigil) {
    return { sigil: null, hadMultiple: false }
  }

  if (unsupportedMultipleSigils.length === 0) {
    return { sigil: primarySigil, hadMultiple: false }
  }

  const allSigils = [primarySigil, ...unsupportedMultipleSigils]
  const best = allSigils.reduce((a, b) =>
    a.confidence >= b.confidence ? a : b,
  )

  return { sigil: best, hadMultiple: true }
}
