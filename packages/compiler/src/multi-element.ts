import type { ElementId, SpellIR, GlyphAST, CompilerConfig, CompilerWarning } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { compileSpell } from './compile.js'

export const ELEMENT_COMBINATION_RULES: Record<string, { [key: string]: ElementId }> = {
  fire: {
    water: 'arcane',
    earth: 'fire',
    wind: 'fire',
    light: 'fire',
    dark: 'fire',
    lightning: 'fire',
    ice: 'water',
    nature: 'fire',
    arcane: 'fire',
  },
  water: {
    fire: 'arcane',
    earth: 'earth',
    wind: 'ice',
    light: 'nature',
    dark: 'water',
    lightning: 'lightning',
    ice: 'ice',
    nature: 'nature',
    arcane: 'water',
  },
  earth: {
    fire: 'fire',
    water: 'earth',
    wind: 'earth',
    light: 'nature',
    dark: 'earth',
    lightning: 'earth',
    ice: 'earth',
    nature: 'nature',
    arcane: 'earth',
  },
  wind: {
    fire: 'fire',
    water: 'ice',
    earth: 'earth',
    light: 'lightning',
    dark: 'wind',
    lightning: 'lightning',
    ice: 'ice',
    nature: 'wind',
    arcane: 'wind',
  },
  light: {
    fire: 'fire',
    water: 'nature',
    earth: 'nature',
    wind: 'lightning',
    dark: 'arcane',
    lightning: 'lightning',
    ice: 'light',
    nature: 'nature',
    arcane: 'arcane',
  },
  dark: {
    fire: 'fire',
    water: 'water',
    earth: 'earth',
    wind: 'wind',
    light: 'arcane',
    lightning: 'dark',
    ice: 'dark',
    nature: 'dark',
    arcane: 'arcane',
  },
  lightning: {
    fire: 'fire',
    water: 'lightning',
    earth: 'earth',
    wind: 'lightning',
    light: 'lightning',
    dark: 'dark',
    ice: 'water',
    nature: 'lightning',
    arcane: 'arcane',
  },
  ice: {
    fire: 'water',
    water: 'ice',
    earth: 'earth',
    wind: 'ice',
    light: 'light',
    dark: 'dark',
    lightning: 'water',
    nature: 'ice',
    arcane: 'ice',
  },
  nature: {
    fire: 'fire',
    water: 'nature',
    earth: 'nature',
    wind: 'wind',
    light: 'nature',
    dark: 'dark',
    lightning: 'lightning',
    ice: 'ice',
    arcane: 'nature',
  },
  arcane: {
    fire: 'fire',
    water: 'water',
    earth: 'earth',
    wind: 'wind',
    light: 'arcane',
    dark: 'arcane',
    lightning: 'arcane',
    ice: 'ice',
    nature: 'nature',
  },
}

export function getCombinedElement(
  a: ElementId,
  b: ElementId,
): ElementId {
  if (a === b) {
    return a
  }
  const row = ELEMENT_COMBINATION_RULES[a]
  if (row && row[b] !== undefined) {
    return row[b]!
  }
  const rowB = ELEMENT_COMBINATION_RULES[b]
  if (rowB && rowB[a] !== undefined) {
    return rowB[a]!
  }
  return a
}

export interface MultiElementInput {
  primary: GlyphAST
  secondary: GlyphAST
  elementA: ElementId
  elementB: ElementId
}

export function compileMultiElement(
  input: MultiElementInput,
  config?: CompilerConfig,
): SpellIR {
  const { primary, secondary, elementA, elementB } = input
  const combinedElement = getCombinedElement(elementA, elementB)

  const primaryResult = compileSpell(primary, config)

  if (!primaryResult.valid) {
    return primaryResult
  }

  const compilerWarnings: CompilerWarning[] = []

  const secondaryResult = compileSpell(secondary, config)

  primaryResult.element = combinedElement
  primaryResult.elementConfidence = Math.min(primaryResult.elementConfidence, secondaryResult.elementConfidence || 0.6)

  const weightA = 0.6
  const weightB = 0.4

  primaryResult.force = clamp(
    primaryResult.force * weightA + secondaryResult.force * weightB,
    0,
    DEFAULT_CONFIG.compiler.maxForce,
  )
  primaryResult.spread = clamp(
    primaryResult.spread * weightA + secondaryResult.spread * weightB,
    0,
    DEFAULT_CONFIG.compiler.maxSpread,
  )
  primaryResult.focus = clamp(
    primaryResult.focus * weightA + secondaryResult.focus * weightB,
    0,
    DEFAULT_CONFIG.compiler.maxFocus,
  )
  primaryResult.range = clamp(
    primaryResult.range * weightA + secondaryResult.range * weightB,
    0,
    DEFAULT_CONFIG.compiler.maxRange,
  )

  const combinedQuality = primaryResult.quality * weightA + secondaryResult.quality * weightB
  primaryResult.quality = clamp(combinedQuality, 0, 1)
  primaryResult.neatness = clamp(
    primaryResult.neatness * weightA + secondaryResult.neatness * weightB,
    0,
    1,
  )

  for (const [key, profile] of Object.entries(secondaryResult.manifestations)) {
    if (!primaryResult.manifestations[key]) {
      primaryResult.manifestations[key] = { ...profile, strength: profile.strength * weightB }
    }
  }

  primaryResult.signature = `multi:${combinedElement}:${primaryResult.force.toFixed(3)}:${primaryResult.spread.toFixed(3)}`
  primaryResult.warnings = [...primaryResult.warnings, ...compilerWarnings]

  return primaryResult
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
