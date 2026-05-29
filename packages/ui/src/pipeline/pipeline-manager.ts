import { parse } from '@glyph-weaver/parser'
import { compileSpell } from '@glyph-weaver/compiler'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { DEFAULT_DICTIONARY } from '@glyph-weaver/dictionary'
import type { Stroke, GlyphAST, SpellIR, AppConfig } from '@glyph-weaver/core'

export interface RingStatus {
  found: boolean
  complete: boolean
  activationEvent: boolean
}

export interface PipelineResult {
  ast: GlyphAST
  spellIR: SpellIR
  duration: number
}

export class PipelineManager {
  private config: AppConfig

  constructor(config?: AppConfig) {
    this.config = config ?? { ...DEFAULT_CONFIG }
    void DEFAULT_DICTIONARY
  }

  processStrokes(strokes: Stroke[], _ringStatus: RingStatus): PipelineResult {
    const start = performance.now()

    const { ast } = parse(strokes, {
      config: this.config.recognition,
    })

    const spellIR = compileSpell(ast, this.config.compiler)

    const duration = performance.now() - start

    return { ast, spellIR, duration }
  }

  updateConfig(config: AppConfig): void {
    this.config = config
  }
}

export const pipelineManager = new PipelineManager()
