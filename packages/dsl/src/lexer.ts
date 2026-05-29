import { TokenType, type Token } from './grammar.js'

export class Lexer {
  private source: string = ''
  private pos: number = 0
  private line: number = 1
  private column: number = 1

  tokenize(source: string): Token[] {
    this.source = source
    this.pos = 0
    this.line = 1
    this.column = 1
    const tokens: Token[] = []

    while (!this.isAtEnd()) {
      const c = this.peek()

      if (c === ' ' || c === '\t' || c === '\r') {
        this.advance()
        continue
      }

      if (c === '\n') {
        this.pos++
        this.line++
        this.column = 1
        continue
      }

      if (c === '/' && this.peek(1) === '/') {
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance()
        }
        continue
      }

      if (this.isDigit(c)) {
        tokens.push(this.readNumber())
        continue
      }

      if (c === '"') {
        tokens.push(this.readString())
        continue
      }

      if (this.isAlpha(c) || c === '_') {
        tokens.push(this.readIdentifierOrKeyword())
        continue
      }

      switch (c) {
        case '{':
          tokens.push(this.makeToken(TokenType.LBRACE, '{'))
          this.advance()
          break
        case '}':
          tokens.push(this.makeToken(TokenType.RBRACE, '}'))
          this.advance()
          break
        case ':':
          tokens.push(this.makeToken(TokenType.COLON, ':'))
          this.advance()
          break
        case ';':
          tokens.push(this.makeToken(TokenType.SEMI, ';'))
          this.advance()
          break
        default:
          this.advance()
          break
      }
    }

    tokens.push(this.makeToken(TokenType.EOF, ''))
    return tokens
  }

  private peek(offset: number = 0): string {
    return this.source[this.pos + offset] ?? '\0'
  }

  private advance(): void {
    this.pos++
    this.column++
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9'
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
  }

  private makeToken(type: TokenType, value: string): Token {
    return { type, value, line: this.line, column: this.column }
  }

  private readNumber(): Token {
    const line = this.line
    const column = this.column
    let value = ''
    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.peek()
      this.advance()
    }
    if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += '.'
      this.advance()
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.peek()
        this.advance()
      }
    }
    return { type: TokenType.NUMBER, value, line, column }
  }

  private readString(): Token {
    const line = this.line
    const column = this.column
    this.advance()
    let value = ''
    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\\' && this.peek(1) === '"') {
        this.advance()
        value += '"'
        this.advance()
        continue
      }
      value += this.peek()
      this.advance()
    }
    if (!this.isAtEnd()) {
      this.advance()
    }
    return { type: TokenType.STRING, value, line, column }
  }

  private readIdentifierOrKeyword(): Token {
    const line = this.line
    const column = this.column
    let value = ''
    while (
      !this.isAtEnd() &&
      (this.isAlpha(this.peek()) || this.isDigit(this.peek()) || this.peek() === '_' || this.peek() === '-')
    ) {
      value += this.peek()
      this.advance()
    }
    const type = this.keywordType(value)
    return { type, value, line, column }
  }

  private keywordType(text: string): TokenType {
    switch (text) {
      case 'sigil':
        return TokenType.SIGIL
      case 'sign':
        return TokenType.SIGN
      case 'ring':
        return TokenType.RING
      case 'at':
        return TokenType.AT
      case 'import':
        return TokenType.IMPORT
      case 'deg':
        return TokenType.DEG
      default:
        return TokenType.IDENTIFIER
    }
  }
}
