export interface ParamNode {
  type: 'Param'
  name: string
  value: number
  line: number
  column: number
}

export interface BlockNode {
  type: 'Block'
  params: ParamNode[]
  line: number
  column: number
}

export interface RingNode {
  type: 'Ring'
  block: BlockNode | null
  line: number
  column: number
}

export interface SigilNode {
  type: 'Sigil'
  name: string
  block: BlockNode | null
  line: number
  column: number
}

export interface SignNode {
  type: 'Sign'
  name: string
  angle: number | null
  block: BlockNode | null
  line: number
  column: number
}

export interface ImportNode {
  type: 'Import'
  path: string
  line: number
  column: number
}

export interface SpellDefNode {
  type: 'SpellDef'
  ring: RingNode
  sigil: SigilNode
  signs: SignNode[]
  line: number
  column: number
}

export type StatementNode = ImportNode | SpellDefNode

export interface ProgramNode {
  type: 'Program'
  statements: StatementNode[]
}
