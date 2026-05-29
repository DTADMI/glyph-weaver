import { describe, it, expect } from 'vitest'
import { DSLtoGlyphAST, glyphASTtoDSL } from '../bidirectional.js'
import { compileDSL } from '../compiler.js'

describe('Bidirectional', () => {
  it('DSL to GlyphAST creates valid AST', () => {
    const source = 'ring sigil fire-sigil sign fire-blast at 0 deg;'
    const ast = DSLtoGlyphAST(source)
    expect(ast.type).toBe('GlyphAST')
    expect(ast.primarySigil).not.toBeNull()
    expect(ast.signs).toHaveLength(1)
  })

  it('GlyphAST to DSL produces parseable DSL', () => {
    const source = 'ring sigil fire-sigil sign fire-blast at 0 deg;'
    const ast = DSLtoGlyphAST(source)
    const dsl = glyphASTtoDSL(ast)
    expect(dsl).toContain('ring')
    expect(dsl).toContain('sigil')
    expect(dsl).toContain('fire-sigil')
    expect(dsl).toContain('sign')
    expect(dsl).toContain('fire-blast')
    expect(dsl).toContain(';')
  })

  it('roundtrip DSL → AST → DSL preserves structure', () => {
    const original = 'ring { size: 1.0; } sigil fire-sigil { force: 0.9; focus: 0.8; } sign fire-blast at 45 deg { range: 0.8; };'
    const ast1 = DSLtoGlyphAST(original)
    const dsl1 = glyphASTtoDSL(ast1)
    const ast2 = DSLtoGlyphAST(dsl1)
    expect(ast2.primarySigil!.element).toBe(ast1.primarySigil!.element)
    expect(ast2.signs).toHaveLength(ast1.signs.length)
    expect(ast2.signs[0]!.angleDeg).toBe(ast1.signs[0]!.angleDeg)
  })

  it('roundtrip preserves sign count and identifiers', () => {
    const original = 'ring sigil water-sigil sign water-heal at 90 deg sign water-wave at 180 deg;'
    const ast = DSLtoGlyphAST(original)
    const dsl = glyphASTtoDSL(ast)
    const reparsed = DSLtoGlyphAST(dsl)
    expect(reparsed.signs).toHaveLength(2)
    const signIds = reparsed.signs.map((s) => s.id)
    expect(signIds).toContain('water-heal')
    expect(signIds).toContain('water-wave')
  })

  it('glyphASTtoDSL handles empty AST gracefully', () => {
    const emptySource = ''
    const result = compileDSL(emptySource)
    const dsl = glyphASTtoDSL(result.ast)
    expect(dsl).toContain('ring')
    expect(dsl).toContain('sigil')
    expect(dsl).toContain('generic-sigil')
  })

  it('DSL → AST → compile produces same element', () => {
    const source = 'ring sigil light-sigil sign light-flash at 0 deg;'
    const ast = DSLtoGlyphAST(source)
    const dsl = glyphASTtoDSL(ast)
    const result = compileDSL(dsl)
    expect(result.ir.element).toBe('light')
  })
})
