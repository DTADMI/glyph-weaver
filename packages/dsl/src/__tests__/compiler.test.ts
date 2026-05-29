import { describe, it, expect } from 'vitest'
import { compileDSL } from '../compiler.js'

describe('Compiler', () => {
  it('compiles simple DSL source to GlyphAST and SpellIR', () => {
    const source = 'ring sigil fire-sigil sign fire-blast at 0 deg;'
    const result = compileDSL(source)
    expect(result.errors).toHaveLength(0)
    expect(result.ast.type).toBe('GlyphAST')
    expect(result.ir.type).toBe('SpellIR')

    expect(result.ast.primarySigil).not.toBeNull()
    expect(result.ast.primarySigil!.element).toBe('fire')
    expect(result.ast.primarySigil!.id).toBe('fire-sigil')

    expect(result.ast.signs).toHaveLength(1)
    expect(result.ast.signs[0]!.id).toBe('fire-blast')
    expect(result.ast.signs[0]!.angleDeg).toBe(0)

    expect(result.ir.valid).toBe(true)
    expect(result.ir.element).toBe('fire')
    expect(result.ir.primaryManifestation).toBe('projectile')
  })

  it('compiles with ring block parameters', () => {
    const source = 'ring { size: 2.0; } sigil earth-sigil sign earth-wall at 270 deg;'
    const result = compileDSL(source)
    expect(result.ast.ring.radius).toBe(2.0)
    expect(result.ir.element).toBe('earth')
  })

  it('compiles sigil semantic block into SpellIR', () => {
    const source = 'ring sigil wind-sigil { force: 0.6; spread: 0.4; range: 0.9; } sign wind-dash at 180 deg;'
    const result = compileDSL(source)
    expect(result.ir.force).toBe(0.6)
    expect(result.ir.spread).toBe(0.4)
    expect(result.ir.range).toBe(0.9)
  })

  it('compiles sign with angle into direction', () => {
    const source = 'ring sigil fire-sigil sign fire-blast at 90 deg;'
    const result = compileDSL(source)
    expect(result.ir.direction.x).toBeCloseTo(0, 1)
    expect(result.ir.direction.y).toBeCloseTo(1, 1)
  })

  it('returns error for unresolved import', () => {
    const source = 'import "nonexistent";\nring sigil fire-sigil;'
    const result = compileDSL(source)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]!.severity).toBe('warning')
  })

  it('returns invalid IR for empty source', () => {
    const result = compileDSL('')
    expect(result.ir.valid).toBe(false)
    expect(result.ir.status).toBe('invalid')
  })

  it('compiles water-heal spell', () => {
    const source = 'ring sigil water-sigil sign water-heal at 90 deg;'
    const result = compileDSL(source)
    expect(result.ast.primarySigil!.element).toBe('water')
    expect(result.ir.primaryManifestation).toBe('aura')
  })

  it('compiles light-flash with multiple signs', () => {
    const source = 'ring sigil light-sigil sign light-flash at 0 deg sign light-zone at 180 deg;'
    const result = compileDSL(source)
    expect(result.ast.signs).toHaveLength(2)
    expect(Object.keys(result.ir.manifestations)).toHaveLength(2)
  })

  it('compiles stdlib fire-blast fully', () => {
    const source = `ring { size: 1.0; } sigil fire-sigil { force: 0.9; focus: 0.8; spread: 0.6; range: 0.8; lifetimeBias: 0.3; } sign fire-blast at 0 deg { force: 0.9; spread: 0.7; range: 1.0; };`
    const result = compileDSL(source)
    expect(result.errors).toHaveLength(0)
    expect(result.ir.valid).toBe(true)
    expect(result.ir.element).toBe('fire')
    expect(result.ir.signature).toBe('dsl:fire:projectile')
  })
})
