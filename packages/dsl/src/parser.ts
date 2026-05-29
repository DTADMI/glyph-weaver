import { TokenType, type Token } from './grammar.js'
import type {
  ProgramNode,
  StatementNode,
  SpellDefNode,
  ImportNode,
  RingNode,
  SigilNode,
  SignNode,
  BlockNode,
  ParamNode,
} from './ast-nodes.js'
import { DslError } from './errors.js'

export class Parser {
  private tokens: Token[] = []
  private current: number = 0
  errors: DslError[] = []

  parse(tokens: Token[]): ProgramNode {
    this.tokens = tokens
    this.current = 0
    this.errors = []
    const statements: StatementNode[] = []

    while (!this.isAtEnd()) {
      try {
        const stmt = this.statement()
        if (stmt) statements.push(stmt)
      } catch (e) {
        if (e instanceof DslError) {
          this.errors.push(e)
          this.synchronize()
        } else {
          throw e
        }
      }
    }

    return { type: 'Program', statements }
  }

  private peek(): Token {
    const tk = this.tokens[this.current]
    if (!tk) return { type: TokenType.EOF, value: '', line: 1, column: 1 }
    return tk
  }

  private advance(): Token {
    const tk = this.tokens[this.current]
    if (tk) this.current++
    return tk ?? { type: TokenType.EOF, value: '', line: 1, column: 1 }
  }

  private previous(): Token {
    return this.tokens[this.current - 1] ?? { type: TokenType.EOF, value: '', line: 1, column: 1 }
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type
  }

  private match(type: TokenType): boolean {
    if (this.check(type)) {
      this.advance()
      return true
    }
    return false
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()
    throw this.error(message)
  }

  private error(message: string): DslError {
    const token = this.peek()
    return new DslError(message, token.line, token.column)
  }

  private synchronize(): void {
    this.advance()
    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMI) return
      switch (this.peek().type) {
        case TokenType.RING:
        case TokenType.IMPORT:
        case TokenType.SIGIL:
        case TokenType.SIGN:
          return
      }
      this.advance()
    }
  }

  private statement(): StatementNode {
    if (this.check(TokenType.IMPORT)) return this.importStatement()
    if (this.check(TokenType.RING)) return this.spellDefinition()
    const errorToken = this.peek()
    throw new DslError(
      `Unexpected token '${errorToken.value}' (${errorToken.type})`,
      errorToken.line,
      errorToken.column,
    )
  }

  private importStatement(): ImportNode {
    const token = this.consume(TokenType.IMPORT, "Expected 'import'")
    const str = this.consume(TokenType.STRING, 'Expected string path after import')
    this.consume(TokenType.SEMI, "Expected ';' after import statement")
    return { type: 'Import', path: str.value, line: token.line, column: token.column }
  }

  private spellDefinition(): SpellDefNode {
    const ringToken = this.consume(TokenType.RING, "Expected 'ring'")
    const ringBlockNode = this.check(TokenType.LBRACE) ? this.block() : null
    const ring: RingNode = {
      type: 'Ring',
      block: ringBlockNode,
      line: ringToken.line,
      column: ringToken.column,
    }

    const sigilToken = this.consume(TokenType.SIGIL, "Expected 'sigil' after ring")
    const sigilName = this.consume(TokenType.IDENTIFIER, 'Expected identifier after sigil')
    const sigilBlockNode = this.check(TokenType.LBRACE) ? this.block() : null
    const sigil: SigilNode = {
      type: 'Sigil',
      name: sigilName.value,
      block: sigilBlockNode,
      line: sigilToken.line,
      column: sigilToken.column,
    }

    const signs: SignNode[] = []
    while (this.check(TokenType.SIGN)) {
      signs.push(this.signDecl())
    }

    this.consume(TokenType.SEMI, "Expected ';' after spell definition")

    return { type: 'SpellDef', ring, sigil, signs, line: ringToken.line, column: ringToken.column }
  }

  private signDecl(): SignNode {
    const token = this.consume(TokenType.SIGN, "Expected 'sign'")
    const name = this.consume(TokenType.IDENTIFIER, 'Expected identifier after sign')

    let angle: number | null = null
    if (this.match(TokenType.AT)) {
      const numToken = this.consume(TokenType.NUMBER, "Expected number after 'at'")
      angle = Number(numToken.value)
      this.consume(TokenType.DEG, "Expected 'deg' after angle number")
    }

    const signBlockNode = this.check(TokenType.LBRACE) ? this.block() : null
    return { type: 'Sign', name: name.value, angle, block: signBlockNode, line: token.line, column: token.column }
  }

  block(): BlockNode {
    const token = this.consume(TokenType.LBRACE, "Expected '{'")
    const params: ParamNode[] = []

    while (!this.check(TokenType.RBRACE) && !this.isAtEnd()) {
      params.push(this.param())
    }

    this.consume(TokenType.RBRACE, "Expected '}' after block")
    return { type: 'Block', params, line: token.line, column: token.column }
  }

  private param(): ParamNode {
    const token = this.peek()
    const name = this.consume(TokenType.IDENTIFIER, 'Expected identifier in param')
    this.consume(TokenType.COLON, "Expected ':' in param")
    const value = this.consume(TokenType.NUMBER, "Expected number after ':' in param")
    this.match(TokenType.SEMI)
    return { type: 'Param', name: name.value, value: Number(value.value), line: token.line, column: token.column }
  }
}
