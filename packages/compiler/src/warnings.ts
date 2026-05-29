import type { ParserWarning } from '@glyph-weaver/core'
import type { CompilerWarning } from '@glyph-weaver/core/types'

export const COMPILER_WARNING_MESSAGES: Record<CompilerWarning, { en: string; fr: string }> = {
  primary_sigil_confidence_low: {
    en: 'Primary sigil has low recognition confidence',
    fr: 'FR: Primary sigil has low recognition confidence',
  },
  multiple_sigils_unsupported: {
    en: 'Multiple sigils detected; only the primary sigil will be used',
    fr: 'FR: Multiple sigils detected; only the primary sigil will be used',
  },
  multiple_rings_unsupported: {
    en: 'Multiple rings detected; only the primary ring will be used',
    fr: 'FR: Multiple rings detected; only the primary ring will be used',
  },
  nested_rings_unsupported: {
    en: 'Nested rings detected; only the outermost ring will be used',
    fr: 'FR: Nested rings detected; only the outermost ring will be used',
  },
  unsupported_element: {
    en: 'Element is not supported in this context',
    fr: 'FR: Element is not supported in this context',
  },
  no_valid_sigil: {
    en: 'No valid sigil found in the glyph',
    fr: 'FR: No valid sigil found in the glyph',
  },
  ring_too_messy: {
    en: 'Ring neatness is below acceptable threshold',
    fr: 'FR: Ring neatness is below acceptable threshold',
  },
  sign_confidence_low: {
    en: 'One or more signs have low recognition confidence',
    fr: 'FR: One or more signs have low recognition confidence',
  },
  mixed_manifestations: {
    en: 'Multiple manifestation types detected; effects may be diluted',
    fr: 'FR: Multiple manifestation types detected; effects may be diluted',
  },
}

export function mergeWarnings(
  parserWarnings: ParserWarning[],
  compilerWarnings: CompilerWarning[],
): Array<ParserWarning | CompilerWarning> {
  return [...parserWarnings, ...compilerWarnings]
}
