export interface Point {
  x: number
  y: number
  t?: number
  pressure?: number
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface Stroke {
  id: string
  points: Point[]
  color: string
  width: number
  timestamp: number
}

export type LayerLabel = 'center' | 'middle' | 'outer' | 'unknown'

export type RadialFacing = 'inward' | 'outward' | 'clockwise' | 'counterclockwise' | 'unclear'

export type RecognitionStatus =
  | 'valid'
  | 'ambiguous'
  | 'contaminated'
  | 'valid_messy'
  | 'unrecognized'

export type DirectionMode = 'position' | 'orientation' | 'inward'

export type ManifestationId =
  | 'aura'
  | 'column'
  | 'levitation'
  | 'convergence'
  | 'barrier'
  | 'projectile'
  | 'area'
  | 'shield'

export type ElementId =
  | 'fire'
  | 'water'
  | 'wind'
  | 'earth'
  | 'light'
  | 'dark'
  | 'lightning'
  | 'ice'
  | 'nature'
  | 'arcane'

export type SpellState = 'prepared' | 'active' | 'invalid'
