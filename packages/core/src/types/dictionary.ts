import type {
  ElementId,
  ManifestationId,
  DirectionMode,
  LayerLabel,
} from './primitives.js'
import type { SigilSemantic, SignSemantic } from './glyph-ast.js'

export interface StrokeTemplatePoint {
  x: number
  y: number
}

export interface StrokeTemplate {
  sourceAspectRatio: number
  strokes: StrokeTemplatePoint[][]
}

export interface SigilEntry {
  id: string
  displayName: string
  element: ElementId
  allowedLayers: LayerLabel[]
  strokeTemplate: StrokeTemplate
  recognitionRotationInvariant: boolean
  semantic: SigilSemantic
}

export interface SignEntry {
  id: string
  displayName: string
  allowedLayers: LayerLabel[]
  sourceNotes?: string
  semantic: SignSemantic & {
    manifestation: ManifestationId
    directionMode: DirectionMode
  }
  strokeTemplate: StrokeTemplate
}

export interface SampleSpellEntry {
  id: string
  displayName: string
  description: string
  element: ElementId
  manifestations: ManifestationId[]
  strokes: StrokeTemplatePoint[][]
}

export interface Dictionary {
  sigils: SigilEntry[]
  signs: SignEntry[]
  sampleSpells: SampleSpellEntry[]
}
