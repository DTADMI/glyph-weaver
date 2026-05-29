import type { GlyphAST } from '@glyph-weaver/core'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateSpellInput(ast: GlyphAST): ValidationResult {
  const errors: string[] = []

  if (!ast.ring || !ast.ring.found) {
    errors.push('Missing required ring')
  }

  if (!ast.primarySigil) {
    errors.push('No primary sigil detected')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
