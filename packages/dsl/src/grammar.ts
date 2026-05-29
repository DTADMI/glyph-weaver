// WHA-DSL Grammar specification (EBNF-like):
//
// program          → statement*
// statement        → importStatement | spellDefinition
// importStatement  → IMPORT STRING SEMI
// spellDefinition  → RING block? sigilDecl signDecl* SEMI
// sigilDecl        → SIGIL IDENTIFIER block?
// signDecl         → SIGN IDENTIFIER (AT NUMBER DEG)? block?
// block            → LBRACE (param SEMI)* RBRACE
// param            → IDENTIFIER COLON NUMBER
//
// Lexical tokens:
//   Keywords:  sigil, sign, ring, at, import, deg
//   Symbols:   { } : ;
//   Literals:  NUMBER (integer or decimal), STRING (double-quoted), IDENTIFIER
//   Comments:  // to end of line
//   Whitespace: space, tab, newline (insignificant)

export enum TokenType {
  SIGIL = 'SIGIL',
  SIGN = 'SIGN',
  RING = 'RING',
  AT = 'AT',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  COLON = 'COLON',
  SEMI = 'SEMI',
  NUMBER = 'NUMBER',
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  IMPORT = 'IMPORT',
  DEG = 'DEG',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}
