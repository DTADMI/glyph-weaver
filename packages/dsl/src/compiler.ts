import type {
  GlyphAST,
  RingCandidate,
  RecognizedSigil,
  RecognizedSign,
  SymbolCandidate,
  UnknownSymbol,
  GlobalMetrics,
  SpellIR,
  AnyManifestationProfile,
  Direction3D,
  ElementId,
  ManifestationId,
  SigilSemantic,
  SignSemantic,
  Point,
} from '@glyph-weaver/core'
import type { BlockNode, SigilNode, SignNode, SpellDefNode } from './ast-nodes.js'
import { Lexer } from './lexer.js'
import { Parser } from './parser.js'
import { resolveImports } from './importer.js'
import { DslError } from './errors.js'
import { TokenType } from './grammar.js'

export interface CompileResult {
  ast: GlyphAST
  ir: SpellIR
  errors: DslError[]
}

function getParam(block: BlockNode | null, name: string, defaultValue: number): number {
  if (!block) return defaultValue
  const p = block.params.find((n) => n.name === name)
  return p ? p.value : defaultValue
}

function elementFromSigilName(name: string): ElementId {
  const prefixMap: Record<string, ElementId> = {
    fire: 'fire',
    water: 'water',
    wind: 'wind',
    earth: 'earth',
    light: 'light',
    dark: 'dark',
    lightning: 'lightning',
    ice: 'ice',
    nature: 'nature',
    arcane: 'arcane',
  }
  const prefix = name.split('-')[0] ?? 'arcane'
  return prefixMap[prefix] ?? 'arcane'
}

function manifestationFromSignName(name: string): ManifestationId {
  const map: Record<string, ManifestationId> = {
    blast: 'projectile',
    heal: 'aura',
    dash: 'levitation',
    wall: 'barrier',
    flash: 'aura',
    strike: 'projectile',
    shield: 'shield',
    cage: 'convergence',
    wave: 'column',
    zone: 'area',
  }
  const suffix = name.split('-').pop() ?? 'aura'
  return map[suffix] ?? 'aura'
}

function createSigilSemantic(block: BlockNode | null): SigilSemantic {
  return {
    force: getParam(block, 'force', 0.7),
    focus: getParam(block, 'focus', 0.7),
    spread: getParam(block, 'spread', 0.5),
    range: getParam(block, 'range', 0.7),
    lifetimeBias: getParam(block, 'lifetimeBias', 0.5),
  }
}

function createSignSemantic(block: BlockNode | null, signName: string): SignSemantic {
  return {
    manifestation: manifestationFromSignName(signName),
    directionMode: 'position',
    force: getParam(block, 'force', 0.7),
    focus: getParam(block, 'focus', 0.7),
    spread: getParam(block, 'spread', 0.5),
    range: getParam(block, 'range', 0.7),
    lifetimeBias: getParam(block, 'lifetimeBias', 0.5),
  }
}

function createSyntheticRing(block: BlockNode | null): RingCandidate {
  const center: Point = { x: 0, y: 0 }
  return {
    found: true,
    center,
    radius: getParam(block, 'size', 1.0),
    complete: true,
    activationEvent: true,
    completeness: 1.0,
    strokeIds: [],
    gap: 0,
    gapArcLength: 0,
    coverageRatio: 1.0,
    roundness: 1.0,
    lineSmoothness: 1.0,
    neatness: getParam(block, 'neatness', 0.9),
    overdrawAmount: 0,
    unsupportedMultipleRings: [],
    unsupportedNestedRings: [],
  }
}

function createSyntheticSigil(sigil: SigilNode): RecognizedSigil {
  const element = elementFromSigilName(sigil.name)
  return {
    candidateId: `synth-${sigil.name}`,
    strokeIds: [],
    id: sigil.name,
    kind: 'sigil',
    recognized: true,
    confidence: 1.0,
    recognitionStatus: 'valid',
    element,
    layer: 'center',
    radiusNorm: 0.5,
    angleDeg: 0,
    sizeNorm: 1.0,
    lengthNorm: 1.0,
    neatness: getParam(sigil.block, 'neatness', 0.9),
    shape: {
      elongation: 0.5,
      dominantAxisStrength: 0.8,
      strokeCount: 1,
      closedness: 1.0,
    },
    semantic: createSigilSemantic(sigil.block),
  }
}

function createSyntheticSign(sign: SignNode, index: number): RecognizedSign {
  return {
    candidateId: `synth-${sign.name}`,
    strokeIds: [],
    id: sign.name,
    kind: 'sign',
    recognized: true,
    confidence: 1.0,
    recognitionStatus: 'valid',
    layer: index === 0 ? 'middle' : 'outer',
    radiusNorm: 0.6,
    angleDeg: sign.angle ?? 0,
    sizeNorm: 1.0,
    lengthNorm: 1.0,
    neatness: getParam(sign.block, 'neatness', 0.9),
    shape: {
      elongation: 0.5,
      dominantAxisStrength: 0.8,
      strokeCount: 1,
      closedness: 0.8,
    },
    semantic: createSignSemantic(sign.block, sign.name),
  }
}

function spellDefToGlyphAST(spell: SpellDefNode): GlyphAST {
  const ring = createSyntheticRing(spell.ring.block)
  const primarySigil = createSyntheticSigil(spell.sigil)
  const signs = spell.signs.map((s, i) => createSyntheticSign(s, i))
  const candidates: SymbolCandidate[] = []

  if (primarySigil) {
    candidates.push({
      candidateId: primarySigil.candidateId,
      strokeIds: [],
      rawStrokeCount: 1,
      cleanedStrokeCount: 1,
      bounds: { minX: -0.5, minY: -0.5, maxX: 0.5, maxY: 0.5 },
      center: ring.center ?? { x: 0, y: 0 },
      radiusNorm: primarySigil.radiusNorm,
      angleDeg: primarySigil.angleDeg,
      layer: primarySigil.layer,
      nearBoundary: false,
      sizeNorm: primarySigil.sizeNorm,
      lengthNorm: primarySigil.lengthNorm,
      orientationDeg: 0,
      directedOrientationDeg: 0,
      radialFacing: 'outward',
      closedness: 1.0,
      overdrawAmount: 0,
      neatness: primarySigil.neatness,
    })
  }

  for (const sign of signs) {
    candidates.push({
      candidateId: sign.candidateId,
      strokeIds: [],
      rawStrokeCount: 1,
      cleanedStrokeCount: 1,
      bounds: { minX: -0.5, minY: -0.5, maxX: 0.5, maxY: 0.5 },
      center: ring.center ?? { x: 0, y: 0 },
      radiusNorm: sign.radiusNorm,
      angleDeg: sign.angleDeg,
      layer: sign.layer,
      nearBoundary: false,
      sizeNorm: sign.sizeNorm,
      lengthNorm: sign.lengthNorm,
      orientationDeg: sign.angleDeg,
      directedOrientationDeg: sign.angleDeg,
      radialFacing: 'outward',
      closedness: 0.8,
      overdrawAmount: 0,
      neatness: sign.neatness,
    })
  }

  const unknowns: UnknownSymbol[] = []
  const globalMetrics: GlobalMetrics = {
    neatness: 0.9,
    radialSymmetry: 0.85,
    instability: 0.1,
  }

  return {
    type: 'GlyphAST',
    version: '0.1.0',
    ring,
    candidates,
    primarySigil,
    unsupportedMultipleSigils: [],
    signs,
    unknowns,
    globalMetrics,
    warnings: [],
  }
}

function glyphASTtoSpellIR(ast: GlyphAST): SpellIR {
  const primarySigil = ast.primarySigil
  const primarySign = ast.signs[0]
  const element: ElementId | null = primarySigil?.element ?? null
  const elementConfidence = primarySigil?.confidence ?? 0

  const manifestations: Record<string, AnyManifestationProfile> = {}
  for (const sign of ast.signs) {
    const profile: AnyManifestationProfile = (() => {
      const mani = sign.semantic.manifestation
      const strength = sign.semantic.force
      switch (mani) {
        case 'projectile':
          return { type: 'projectile' as const, strength }
        case 'column':
          return { type: 'column' as const, strength }
        case 'levitation':
          return { type: 'levitation' as const, strength }
        case 'barrier':
          return { type: 'barrier' as const, strength }
        case 'aura':
          return { type: 'aura' as const, strength }
        case 'convergence':
          return { type: 'convergence' as const, point: { x: 0, y: 0 }, radius: 0.5, rigidity: 0.5, strength }
        default:
          return { type: 'aura' as const, strength }
      }
    })()
    manifestations[sign.id] = profile
  }

  const primaryManifestation: ManifestationId | 'none' = primarySign
    ? primarySign.semantic.manifestation
    : 'none'

  const signAngle = primarySign?.angleDeg ?? 0
  const radians = (signAngle * Math.PI) / 180
  const direction: Direction3D = {
    x: Math.cos(radians),
    y: Math.sin(radians),
    z: 0,
    xTiltDeg: 0,
    yTiltDeg: 0,
    tiltFromZDeg: 0,
  }

  const sigilSemantic = primarySigil?.semantic

  return {
    type: 'SpellIR',
    valid: true,
    active: false,
    prepared: true,
    status: 'prepared',
    activatedAt: null,
    element,
    elementConfidence,
    primarySizeNorm: primarySigil?.sizeNorm ?? 1.0,
    effectScale: 0.8,
    primaryManifestation,
    manifestations,
    direction,
    directionCoherence: ast.signs.length > 1 ? 0.6 : 1.0,
    gravity: 9.8,
    force: sigilSemantic?.force ?? 0.7,
    spread: sigilSemantic?.spread ?? 0.5,
    focus: sigilSemantic?.focus ?? 0.7,
    range: sigilSemantic?.range ?? 0.7,
    duration: 5.0,
    stability: 0.8,
    quality: 0.9,
    neatness: ast.globalMetrics.neatness,
    warnings: [],
    signature: `dsl:${element ?? 'unknown'}:${primaryManifestation}`,
  }
}

export function compileDSL(source: string): CompileResult {
  const lexer = new Lexer()
  const tokens = lexer.tokenize(source)
  const parser = new Parser()
  const program = parser.parse(tokens)
  const errors = [...parser.errors]

  const imports = resolveImports(program.statements)

  for (const imp of imports) {
    if (!imp.resolved) {
      const importStmt = program.statements.find(
        (s) => s.type === 'Import' && s.path === imp.name,
      )
      if (importStmt) {
        errors.push(new DslError(`Unresolved import: "${imp.name}"`, importStmt.line, importStmt.column, 'warning'))
      }
    }
  }

  const spellDef = program.statements.find((s): s is import('./ast-nodes.js').SpellDefNode => s.type === 'SpellDef')

  if (!spellDef) {
    const ast: GlyphAST = {
      type: 'GlyphAST',
      version: '0.1.0',
      ring: {
        found: false,
        center: null,
        radius: 1.0,
        complete: false,
        activationEvent: false,
        completeness: 0,
        strokeIds: [],
        gap: 0,
        gapArcLength: 0,
        coverageRatio: 0,
        roundness: 0,
        lineSmoothness: 0,
        neatness: 0,
        overdrawAmount: 0,
        unsupportedMultipleRings: [],
        unsupportedNestedRings: [],
      },
      candidates: [],
      primarySigil: null,
      unsupportedMultipleSigils: [],
      signs: [],
      unknowns: [],
      globalMetrics: { neatness: 0, radialSymmetry: 0, instability: 0 },
      warnings: ['no_ring_detected', 'missing_primary_sigil'],
    }
    const ir: SpellIR = {
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
      gravity: 9.8,
      force: 0,
      spread: 0,
      focus: 0,
      range: 0,
      duration: 0,
      stability: 0,
      quality: 0,
      neatness: 0,
      warnings: ['no_valid_sigil'],
      signature: 'dsl:unknown:none',
    }
    return { ast, ir, errors }
  }

  const ast = spellDefToGlyphAST(spellDef)
  const ir = glyphASTtoSpellIR(ast)
  return { ast, ir, errors }
}

export { Lexer, Parser, TokenType, DslError }
