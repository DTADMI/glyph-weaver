import { describe, it, expect } from 'vitest'
import { Lexer } from '../lexer.js'
import { TokenType } from '../grammar.js'

describe('Lexer', () => {
  it('tokenizes keywords', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring sigil sign at import deg')
    const types = tokens.map((t) => t.type)
    expect(types).toEqual([
      TokenType.RING,
      TokenType.SIGIL,
      TokenType.SIGN,
      TokenType.AT,
      TokenType.IMPORT,
      TokenType.DEG,
      TokenType.EOF,
    ])
  })

  it('tokenizes numbers', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('42 3.14 100')
    const numbers = tokens.filter((t) => t.type === TokenType.NUMBER)
    expect(numbers.map((n) => n.value)).toEqual(['42', '3.14', '100'])
  })

  it('tokenizes strings', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('"hello" "fire-blast"')
    const strings = tokens.filter((t) => t.type === TokenType.STRING)
    expect(strings.map((s) => s.value)).toEqual(['hello', 'fire-blast'])
  })

  it('tokenizes identifiers', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('fire-sigil water-heal my_var')
    const ids = tokens.filter((t) => t.type === TokenType.IDENTIFIER)
    expect(ids.map((i) => i.value)).toEqual(['fire-sigil', 'water-heal', 'my_var'])
  })

  it('tokenizes braces, colons, semicolons', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('{ } : ;')
    const types = tokens.map((t) => t.type)
    expect(types).toEqual([
      TokenType.LBRACE,
      TokenType.RBRACE,
      TokenType.COLON,
      TokenType.SEMI,
      TokenType.EOF,
    ])
  })

  it('skips comments', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring // this is a comment\nsigil')
    const types = tokens.map((t) => t.type)
    expect(types).toEqual([TokenType.RING, TokenType.SIGIL, TokenType.EOF])
  })

  it('tracks line and column', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('ring\nsigil')
    expect(tokens[0]!.line).toBe(1)
    expect(tokens[0]!.column).toBe(1)
    expect(tokens[1]!.line).toBe(2)
    expect(tokens[1]!.column).toBe(1)
  })

  it('tokenizes a simple import', () => {
    const lexer = new Lexer()
    const tokens = lexer.tokenize('import "fire-blast";')
    const types = tokens.map((t) => t.type)
    expect(types).toEqual([
      TokenType.IMPORT,
      TokenType.STRING,
      TokenType.SEMI,
      TokenType.EOF,
    ])
  })

  it('tokenizes a complete spell definition', () => {
    const lexer = new Lexer()
    const source = 'ring { size: 1.0; } sigil fire-sigil { force: 0.9; } sign fire-blast at 45 deg { range: 0.8; };'
    const tokens = lexer.tokenize(source)
    const types = tokens.map((t) => t.type)
    expect(types).toContain(TokenType.RING)
    expect(types).toContain(TokenType.SIGIL)
    expect(types).toContain(TokenType.SIGN)
    expect(types).toContain(TokenType.NUMBER)
    expect(types).toContain(TokenType.DEG)
    expect(tokens[tokens.length - 1]!.type).toBe(TokenType.EOF)
  })
})
