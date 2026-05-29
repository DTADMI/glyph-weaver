import type { RecognizedSigil, RecognizedSign, CompilerConfig } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'

export interface ComputedParameters {
  force: number
  spread: number
  focus: number
  range: number
  gravity: number
}

export function computeParameters(
  sigil: RecognizedSigil | null,
  signs: RecognizedSign[],
  config: CompilerConfig = DEFAULT_CONFIG.compiler,
): ComputedParameters {
  const { maxForce, maxSpread, maxFocus, maxRange, defaultGravity } = config

  if (!sigil) {
    return {
      force: 0,
      spread: 0,
      focus: 0,
      range: 0,
      gravity: defaultGravity,
    }
  }

  const sigilSem = sigil.semantic

  let force = sigilSem.force * sigil.confidence
  let spread = sigilSem.spread * sigil.confidence
  let focus = sigilSem.focus * sigil.confidence
  let range = sigilSem.range * sigil.confidence

  for (const sign of signs) {
    if (!sign.recognized) {
      continue
    }
    const w = sign.confidence * 0.4
    force += sign.semantic.force * w
    spread += sign.semantic.spread * w
    focus += sign.semantic.focus * w
    range += sign.semantic.range * w
  }

  const signCount = signs.filter((s) => s.recognized).length
  const divisor = 1 + signCount * 0.4

  return {
    force: clamp(force / divisor, 0, maxForce),
    spread: clamp(spread / divisor, 0, maxSpread),
    focus: clamp(focus / divisor, 0, maxFocus),
    range: clamp(range / divisor, 0, maxRange),
    gravity: defaultGravity,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
