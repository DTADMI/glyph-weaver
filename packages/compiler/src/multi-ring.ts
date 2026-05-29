import type { GlyphAST, SpellIR, CompilerConfig, CompilerWarning } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { compileSpell } from './compile.js'

export function compileMultiRing(
  asts: GlyphAST[],
  config?: CompilerConfig,
): SpellIR {
  if (asts.length === 0) {
    return {
      type: 'SpellIR',
      valid: false,
      active: false,
      prepared: false,
      status: 'invalid',
      activatedAt: null,
      element: null,
      elementConfidence: 0,
      primarySizeNorm: 0,
      effectScale: 0,
      primaryManifestation: 'none',
      manifestations: {},
      direction: { x: 0, y: 0, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 },
      directionCoherence: 0,
      gravity: 0,
      force: 0,
      spread: 0,
      focus: 0,
      range: 0,
      duration: 0,
      stability: 0,
      quality: 0,
      neatness: 0,
      warnings: ['no_valid_sigil' as CompilerWarning],
      signature: 'invalid',
    }
  }

  if (asts.length === 1) {
    return compileSpell(asts[0]!, config)
  }

  const outer = asts[0]!
  const inner = asts.slice(1)

  let result = compileSpell(outer, config)

  if (!result.valid) {
    return result
  }

  for (const innerAst of inner) {
    const innerResult = compileSpell(innerAst, config)

    if (!innerResult.valid) {
      continue
    }

    const innerWeight = 0.35

    result.force = clamp(
      result.force + innerResult.force * innerWeight,
      0,
      DEFAULT_CONFIG.compiler.maxForce,
    )
    result.spread = clamp(
      result.spread + innerResult.spread * innerWeight,
      0,
      DEFAULT_CONFIG.compiler.maxSpread,
    )
    result.focus = clamp(
      result.focus + innerResult.focus * innerWeight,
      0,
      DEFAULT_CONFIG.compiler.maxFocus,
    )
    result.range = clamp(
      result.range + innerResult.range * innerWeight,
      0,
      DEFAULT_CONFIG.compiler.maxRange,
    )

    result.quality = clamp(result.quality + innerResult.quality * innerWeight, 0, 1)
    result.neatness = clamp(result.neatness + innerResult.neatness * innerWeight, 0, 1)
    result.directionCoherence = clamp(
      result.directionCoherence + innerResult.directionCoherence * innerWeight,
      0,
      1,
    )

    for (const [key, profile] of Object.entries(innerResult.manifestations)) {
      if (!result.manifestations[key]) {
        result.manifestations[key] = { ...profile, strength: profile.strength * 0.3 }
      } else {
        const existing = result.manifestations[key]
        if (existing) {
          result.manifestations[key] = {
            ...existing,
            strength: clamp(existing.strength + profile.strength * 0.3, 0, 1),
          }
        }
      }
    }

    if (innerResult.element && result.element !== innerResult.element) {
      result.signature = `nested:${result.element ?? 'unknown'}:${innerResult.element}:${result.force.toFixed(3)}`
    }
  }

  return result
}

export function compileLinkedRings(
  asts: GlyphAST[],
  config?: CompilerConfig,
): SpellIR {
  if (asts.length === 0) {
    return {
      type: 'SpellIR',
      valid: false,
      active: false,
      prepared: false,
      status: 'invalid',
      activatedAt: null,
      element: null,
      elementConfidence: 0,
      primarySizeNorm: 0,
      effectScale: 0,
      primaryManifestation: 'none',
      manifestations: {},
      direction: { x: 0, y: 0, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 },
      directionCoherence: 0,
      gravity: 0,
      force: 0,
      spread: 0,
      focus: 0,
      range: 0,
      duration: 0,
      stability: 0,
      quality: 0,
      neatness: 0,
      warnings: ['no_valid_sigil' as CompilerWarning],
      signature: 'invalid',
    }
  }

  if (asts.length === 1) {
    return compileSpell(asts[0]!, config)
  }

  const individualResults = asts.map((ast) => compileSpell(ast, config))
  const validResults = individualResults.filter((r) => r.valid)

  if (validResults.length === 0) {
    return {
      type: 'SpellIR',
      valid: false,
      active: false,
      prepared: false,
      status: 'invalid',
      activatedAt: null,
      element: null,
      elementConfidence: 0,
      primarySizeNorm: 0,
      effectScale: 0,
      primaryManifestation: 'none',
      manifestations: {},
      direction: { x: 0, y: 0, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 },
      directionCoherence: 0,
      gravity: 0,
      force: 0,
      spread: 0,
      focus: 0,
      range: 0,
      duration: 0,
      stability: 0,
      quality: 0,
      neatness: 0,
      warnings: ['no_valid_sigil' as CompilerWarning],
      signature: 'invalid',
    }
  }

  const first = validResults[0]!
  const count = validResults.length

  let totalForce = 0
  let totalSpread = 0
  let totalFocus = 0
  let totalRange = 0
  let totalQuality = 0
  let totalNeatness = 0
  let totalCoherence = 0
  let totalDuration = 0

  const allManifestations: Record<string, { totalStrength: number; count: number }> = {}

  for (const r of validResults) {
    totalForce += r.force
    totalSpread += r.spread
    totalFocus += r.focus
    totalRange += r.range
    totalQuality += r.quality
    totalNeatness += r.neatness
    totalCoherence += r.directionCoherence
    totalDuration += r.duration

    for (const [key, profile] of Object.entries(r.manifestations)) {
      if (!allManifestations[key]) {
        allManifestations[key] = { totalStrength: 0, count: 0 }
      }
      allManifestations[key]!.totalStrength += profile.strength
      allManifestations[key]!.count += 1
    }
  }

  const additiveBoost = 1 + (count - 1) * 0.15

  const manifestations: Record<string, import('@glyph-weaver/core').AnyManifestationProfile> = {}
  for (const [key, data] of Object.entries(allManifestations)) {
    manifestations[key] = buildLinkedProfile(key, data.totalStrength / data.count, additiveBoost)
  }

  const longestDuration = validResults.reduce((max, r) => Math.max(max, r.duration), 0)
  const avgQuality = totalQuality / count

  return {
    ...first,
    force: clamp(totalForce / count * additiveBoost, 0, DEFAULT_CONFIG.compiler.maxForce),
    spread: clamp(totalSpread / count * additiveBoost, 0, DEFAULT_CONFIG.compiler.maxSpread),
    focus: clamp(totalFocus / count * additiveBoost, 0, DEFAULT_CONFIG.compiler.maxFocus),
    range: clamp(totalRange / count * additiveBoost, 0, DEFAULT_CONFIG.compiler.maxRange),
    quality: clamp(avgQuality, 0, 1),
    neatness: clamp(totalNeatness / count, 0, 1),
    directionCoherence: clamp(totalCoherence / count, 0, 1),
    duration: longestDuration,
    manifestations,
    signature: `linked:${count}:${first.force.toFixed(3)}`,
  }
}

function buildLinkedProfile(
  manifestationType: string,
  avgStrength: number,
  boost: number,
): import('@glyph-weaver/core').AnyManifestationProfile {
  const strength = clamp(avgStrength * boost, 0, 1)
  switch (manifestationType) {
    case 'aura':
      return { type: 'aura', strength }
    case 'column':
      return { type: 'column', strength }
    case 'levitation':
      return { type: 'levitation', strength }
    case 'convergence':
      return { type: 'convergence', strength, point: { x: 0, y: 0 }, radius: 0.5, rigidity: 0.5 }
    case 'barrier':
      return { type: 'barrier', strength }
    case 'projectile':
      return { type: 'projectile', strength }
    default:
      return { type: 'barrier', strength }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
