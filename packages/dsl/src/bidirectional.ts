import type {
  GlyphAST,
  RecognizedSigil,
  RecognizedSign,
  SigilSemantic,
  SignSemantic,
} from '@glyph-weaver/core'
import { compileDSL } from './compiler.js'

function semanticToParams(semantic: SigilSemantic | SignSemantic): string {
  const parts: string[] = []
  parts.push(`force: ${semantic.force}`)
  parts.push(`focus: ${semantic.focus}`)
  parts.push(`spread: ${semantic.spread}`)
  parts.push(`range: ${semantic.range}`)
  if ('lifetimeBias' in semantic) {
    parts.push(`lifetimeBias: ${semantic.lifetimeBias}`)
  }
  return parts.join('; ')
}

function sigilToDSL(sigil: RecognizedSigil): string {
  const block = semanticToParams(sigil.semantic)
  return `sigil ${sigil.id} { ${block}; }`
}

function signToDSL(sign: RecognizedSign): string {
  const block = semanticToParams(sign.semantic)
  const atClause = `at ${sign.angleDeg} deg`
  return `sign ${sign.id} ${atClause} { ${block}; }`
}

export function glyphASTtoDSL(ast: GlyphAST): string {
  const parts: string[] = []
  if (ast.ring.found) {
    parts.push(`ring { size: ${ast.ring.radius}; }`)
  } else {
    parts.push('ring { size: 1.0; }')
  }

  if (ast.primarySigil) {
    parts.push(sigilToDSL(ast.primarySigil))
  } else {
    parts.push('sigil generic-sigil { force: 0.7; focus: 0.7; spread: 0.5; range: 0.7; lifetimeBias: 0.5; }')
  }

  for (const sign of ast.signs) {
    parts.push(signToDSL(sign))
  }

  return parts.join(' ') + ';'
}

export function DSLtoGlyphAST(source: string): GlyphAST {
  const result = compileDSL(source)
  return result.ast
}
