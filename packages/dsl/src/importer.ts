import type { StatementNode } from './ast-nodes.js'
import { STDLIB_SPELLS } from './stdlib.js'

export interface ImportResult {
  name: string
  source: string | null
  resolved: boolean
}

export function resolveImport(name: string): ImportResult {
  if (STDLIB_SPELLS[name]) {
    return { name, source: STDLIB_SPELLS[name]!, resolved: true }
  }
  return { name, source: null, resolved: false }
}

export function resolveImports(statements: StatementNode[]): ImportResult[] {
  const results: ImportResult[] = []
  for (const stmt of statements) {
    if (stmt.type === 'Import') {
      results.push(resolveImport(stmt.path))
    }
  }
  return results
}
