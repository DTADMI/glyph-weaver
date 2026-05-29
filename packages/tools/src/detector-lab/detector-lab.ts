import type { Dictionary, RecognizedSigil, RecognizedSign, UnknownSymbol, GlyphAST } from '@glyph-weaver/core'

export interface DetectionResult {
  sigil: RecognizedSigil | null
  alternativeSigils: Array<{ id: string; confidence: number }>
  signs: RecognizedSign[]
  unknowns: UnknownSymbol[]
  confidence: number
  diagnosticInfo: {
    strokeCount: number
    pointCount: number
    ringFound: boolean
    ringComplete: boolean
    candidatesDetected: number
    processingTimeMs: number
    warnings: string[]
  }
}

export class DetectorLab {
  private dictionary: Dictionary | null = null

  setDictionary(dictionary: Dictionary): void {
    this.dictionary = dictionary
  }

  attachCanvas(_canvas: HTMLCanvasElement): void {
    void _canvas
  }

  runDetection(): DetectionResult {
    const startTime = performance.now()
    const diagnosticInfo = {
      strokeCount: 0,
      pointCount: 0,
      ringFound: false,
      ringComplete: false,
      candidatesDetected: 0,
      processingTimeMs: 0,
      warnings: [] as string[],
    }

    if (!this.dictionary) {
      diagnosticInfo.warnings.push('No dictionary loaded')
    }

    const endTime = performance.now()
    diagnosticInfo.processingTimeMs = Math.round(endTime - startTime)

    return {
      sigil: null,
      alternativeSigils: [],
      signs: [],
      unknowns: [],
      confidence: 0,
      diagnosticInfo,
    }
  }

  async recognizeFromAST(ast: GlyphAST): Promise<DetectionResult> {
    const startTime = performance.now()
    const sigil = ast.primarySigil
    const signs = ast.signs
    const unknowns = ast.unknowns

    const altSigils: Array<{ id: string; confidence: number }> = ast.unsupportedMultipleSigils.map(
      (s) => ({ id: s.id, confidence: s.confidence }),
    )

    const warnings = ast.warnings.map(String)
    const confidence = sigil?.confidence ?? 0

    if (!this.dictionary) {
      warnings.push('No dictionary loaded — results are from AST only')
    }

    const endTime = performance.now()

    return {
      sigil,
      alternativeSigils: altSigils,
      signs,
      unknowns,
      confidence,
      diagnosticInfo: {
        strokeCount: ast.candidates.reduce((sum, c) => sum + c.rawStrokeCount, 0),
        pointCount: 0,
        ringFound: ast.ring.found,
        ringComplete: ast.ring.complete,
        candidatesDetected: ast.candidates.length,
        processingTimeMs: Math.round(endTime - startTime),
        warnings,
      },
    }
  }

  getAvailableDictionaries(): string[] {
    return this.dictionary
      ? this.dictionary.sigils.map((s) => s.id)
      : []
  }

  getElementLabel(element: string): string {
    const labels: Record<string, string> = {
      fire: 'Fire',
      water: 'Water',
      wind: 'Wind',
      earth: 'Earth',
      light: 'Light',
      dark: 'Dark',
      lightning: 'Lightning',
      ice: 'Ice',
      nature: 'Nature',
      arcane: 'Arcane',
    }
    return labels[element] ?? element
  }
}
