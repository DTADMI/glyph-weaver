import type { GlyphAST, SpellIR, CompilerConfig, CompilerWarning } from '@glyph-weaver/core'
import { DEFAULT_CONFIG } from '@glyph-weaver/core'
import { extractPrimarySigil } from './sigil-extractor.js'
import { aggregateSigns } from './sign-aggregator.js'
import { computeParameters } from './parameter-computer.js'
import { computeDirection } from './direction-computer.js'
import { computeQuality, computeStability, computeDuration } from './quality-scorer.js'
import { validateSpellInput } from './validate.js'
import { buildSpellIR, buildInvalidSpell } from './spell-builder.js'
import { mergeWarnings } from './warnings.js'

export function compileSpell(
  ast: GlyphAST,
  config?: CompilerConfig,
): SpellIR {
  const validation = validateSpellInput(ast)
  if (!validation.valid) {
    return buildInvalidSpell([
      ...ast.warnings,
      ...validation.errors.map((e) => {
        if (e.includes('sigil')) {
          return 'no_valid_sigil' as CompilerWarning
        }
        if (e.includes('ring')) {
          return 'multiple_rings_unsupported' as CompilerWarning
        }
        return 'unsupported_element' as CompilerWarning
      }),
    ])
  }

  const compilerWarnings: CompilerWarning[] = []
  const compilerConfig = config ?? DEFAULT_CONFIG.compiler

  const { sigil, hadMultiple } = extractPrimarySigil(ast)

  if (!sigil) {
    return buildInvalidSpell([
      ...ast.warnings,
      'no_valid_sigil' as CompilerWarning,
    ])
  }

  if (hadMultiple) {
    compilerWarnings.push('multiple_sigils_unsupported')
  }

  if (sigil.confidence < 0.6) {
    compilerWarnings.push('primary_sigil_confidence_low')
  }

  if (ast.ring && ast.ring.neatness < 0.3) {
    compilerWarnings.push('ring_too_messy')
  }

  const signResult = aggregateSigns(ast)

  if (signResult.recognizedCount > 1) {
    const manifestationTypes = new Set(
      ast.signs
        .filter((s) => s.recognized)
        .map((s) => s.semantic.manifestation),
    )
    if (manifestationTypes.size > 1) {
      compilerWarnings.push('mixed_manifestations')
    }
  }

  const lowConfidenceSigns = ast.signs.filter(
    (s) => s.recognized && s.confidence < 0.55,
  )
  if (lowConfidenceSigns.length > 0) {
    compilerWarnings.push('sign_confidence_low')
  }

  const params = computeParameters(sigil, ast.signs, compilerConfig)
  const directionResult = computeDirection(ast.signs, ast.ring)
  const qualityResult = computeQuality(ast.ring, sigil, ast.signs, ast)
  const stability = computeStability(qualityResult.quality, ast.globalMetrics.instability)

  const lifetimeBias = sigil.semantic.lifetimeBias
  const duration = computeDuration(qualityResult.quality, qualityResult.neatness, lifetimeBias)

  const allWarnings = mergeWarnings(ast.warnings, compilerWarnings)

  const effectScale = clamp(
    DEFAULT_CONFIG.renderer.defaultEffectScale * sigil.sizeNorm,
    DEFAULT_CONFIG.renderer.minEffectScale,
    DEFAULT_CONFIG.renderer.maxEffectScale,
  )

  return buildSpellIR({
    sigilElement: sigil.element,
    sigilConfidence: sigil.confidence,
    sigilSizeNorm: sigil.sizeNorm,
    params,
    directionResult,
    qualityResult,
    signResult,
    stability,
    duration,
    warnings: allWarnings,
    effectScale,
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
