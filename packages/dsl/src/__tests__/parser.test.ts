import { describe, it, expect } from 'vitest'
import { Lexer } from '../lexer.js'
import { Parser } from '../parser.js'

describe('Parser', () => {
  it('parses import statement', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('import "fire-blast";')
    const parser = new Parser()
    const program = parser.parse(tokens)
    expect(program.statements).toHaveLength(1)
    const stmt = program.statements[0]
    expect(stmt).toBeDefined()
    if (stmt && stmt.type === 'Import') {
      expect(stmt.path).toBe('fire-blast')
    }
  })

  it('parses minimal spell definition', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil fire-sigil;')
    const parser = new Parser()
    const program = parser.parse(tokens)
    expect(program.statements).toHaveLength(1)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
  })

  it('parses spell with ring block', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring { size: 1.0; } sigil fire-sigil;')
    const parser = new Parser()
    const program = parser.parse(tokens)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.ring.block).not.toBeNull()
      expect(stmt.ring.block!.params).toHaveLength(1)
      expect(stmt.ring.block!.params[0]!.name).toBe('size')
      expect(stmt.ring.block!.params[0]!.value).toBe(1.0)
    }
  })

  it('parses sigil with block', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil fire-sigil { force: 0.9; spread: 0.5; };')
    const parser = new Parser()
    const program = parser.parse(tokens)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.sigil.name).toBe('fire-sigil')
      expect(stmt.sigil.block).not.toBeNull()
      expect(stmt.sigil.block!.params).toHaveLength(2)
    }
  })

  it('parses sign with angle', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil fire-sigil sign fire-blast at 45 deg;')
    const parser = new Parser()
    const program = parser.parse(tokens)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.signs).toHaveLength(1)
      expect(stmt.signs[0]!.name).toBe('fire-blast')
      expect(stmt.signs[0]!.angle).toBe(45)
    }
  })

  it('parses sign with block', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil fire-sigil sign fire-blast at 90 deg { range: 0.8; force: 0.9; };')
    const parser = new Parser()
    const program = parser.parse(tokens)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.signs).toHaveLength(1)
      expect(stmt.signs[0]!.block).not.toBeNull()
      expect(stmt.signs[0]!.block!.params).toHaveLength(2)
    }
  })

  it('parses multiple signs', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil fire-sigil sign fire-blast at 0 deg sign fire-wave at 90 deg;')
    const parser = new Parser()
    const program = parser.parse(tokens)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.signs).toHaveLength(2)
    }
  })

  it('parses complete spell with all features', () => {
    const source = `ring { size: 1.0; neatness: 0.95; } sigil fire-sigil { force: 0.9; focus: 0.8; spread: 0.6; range: 0.8; lifetimeBias: 0.3; } sign fire-blast at 0 deg { range: 1.0; force: 0.9; };`
    const lexer = new Lexer()
    const tokens = lexer.tokenize(source)
    const parser = new Parser()
    const program = parser.parse(tokens)
    expect(program.statements).toHaveLength(1)
    const stmt = program.statements[0]
    expect(stmt!.type).toBe('SpellDef')
    if (stmt && stmt.type === 'SpellDef') {
      expect(stmt.ring.block!.params).toHaveLength(2)
      expect(stmt.sigil.block!.params).toHaveLength(5)
      expect(stmt.signs).toHaveLength(1)
    }
  })

  it('parses import followed by spell', () => {
    const source = `import "fire-blast";\nring sigil water-sigil sign water-heal at 90 deg;`
    const lexer = new Lexer()
    const tokens = lexer.tokenize(source)
    const parser = new Parser()
    const program = parser.parse(tokens)
    expect(program.statements).toHaveLength(2)
    expect(program.statements[0]!.type).toBe('Import')
    expect(program.statements[1]!.type).toBe('SpellDef')
  })
})
