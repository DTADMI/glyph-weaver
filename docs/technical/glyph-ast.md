# GlyphAST Contract

## Purpose

The GlyphAST is the parsed drawing structure produced by the parser pipeline. It captures ring geometry, stroke candidates, recognized sigils/signs, unknown symbols, global quality metrics, and any parser warnings encountered during analysis. All downstream stages (compiler, renderer, diagnostics) consume an `GlyphAST` instance.

## Top-Level Fields

| Field | Type | Description |
| --- | --- | --- |
| `type` | `'GlyphAST'` | Discriminant literal for the AST object |
| `version` | `string` | Schema version identifier |
| `ring` | `RingCandidate` | Detected ring (enclosure) geometry and quality |
| `candidates` | `SymbolCandidate[]` | All raw stroke-groups candidates before recognition |
| `primarySigil` | `RecognizedSigil \| null` | Highest-confidence recognized sigil (the primary element source) |
| `unsupportedMultipleSigils` | `RecognizedSigil[]` | Additional sigils beyond the primary (not yet supported) |
| `signs` | `RecognizedSign[]` | Recognized modifier signs around the ring |
| `unknowns` | `UnknownSymbol[]` | Stroke groups that could not be identified |
| `globalMetrics` | `GlobalMetrics` | Aggregate drawing quality scores |
| `warnings` | `ParserWarning[]` | Non-fatal issues encountered during parsing |

## Ring Fields (`RingCandidate`)

| Field | Type | Description |
| --- | --- | --- |
| `found` | `boolean` | Whether a ring was detected at all |
| `center` | `Point \| null` | Center coordinates (null if `found === false`) |
| `radius` | `number` | Estimated ring radius |
| `complete` | `boolean` | Whether the ring forms a closed loop |
| `activationEvent` | `boolean` | Whether a distinct activation stroke was detected |
| `completeness` | `number` | 0-1 fraction of the circumference covered |
| `strokeIds` | `string[]` | Stroke IDs belonging to the ring |
| `gap` | `number` | Largest gap width in pixels |
| `gapArcLength` | `number` | Angular extent of the gap in degrees |
| `coverageRatio` | `number` | Ink coverage ratio along the ring path |
| `roundness` | `number` | 0-1 shape roundness score |
| `lineSmoothness` | `number` | Stroke smoothness score |
| `neatness` | `number` | Overall ring neatness score |
| `overdrawAmount` | `number` | Excess drawing on top of the ring |
| `unsupportedMultipleRings` | `RingCandidate[]` | Additional rings beyond the primary (not yet supported) |
| `unsupportedNestedRings` | `RingCandidate[]` | Rings inside the primary ring (not yet supported) |

## Candidate Fields (`SymbolCandidate`)

| Field | Type | Description |
| --- | --- | --- |
| `candidateId` | `string` | Unique candidate identifier |
| `strokeIds` | `string[]` | Stroke IDs in this group |
| `rawStrokeCount` | `number` | Original stroke count before cleaning |
| `cleanedStrokeCount` | `number` | Stroke count after merging/cleaning |
| `bounds` | `{ minX, minY, maxX, maxY }` | Bounding box |
| `center` | `Point` | Centroid of the stroke group |
| `radiusNorm` | `number` | Normalized distance from ring center (0=center, 1=ring edge) |
| `angleDeg` | `number` | Angular position in degrees (clockwise from top) |
| `layer` | `LayerLabel` | Ring layer zone: `'center'`, `'middle'`, `'outer'`, or `'unknown'` |
| `nearBoundary` | `boolean` | Whether the symbol sits near a layer boundary |
| `sizeNorm` | `number` | Normalized bounding box diagonal (0-1) |
| `lengthNorm` | `number` | Normalized total stroke length |
| `orientationDeg` | `number` | Principal orientation angle (0-360) |
| `directedOrientationDeg` | `number` | Oriented angle (180 wider range) |
| `radialFacing` | `RadialFacing` | Direction the symbol faces relative to ring center |
| `closedness` | `number` | 0-1 stroke closedness score |
| `overdrawAmount` | `number` | Amount of overdraw on this candidate |
| `neatness` | `number` | Stroke neatness score |

## Recognized Symbol Fields

### `RecognizedSigil`

Extends candidate information with `id` (sigil identifier), `kind: 'sigil'`, `recognized` flag, `confidence`, `recognitionStatus`, `element`, `shape` (SymbolShape), and `semantic` (SigilSemantic: `force`, `focus`, `spread`, `range`, `lifetimeBias`).

### `RecognizedSign`

Same structural fields as sigil except `kind: 'sign'`, no `element` field, and semantic is `SignSemantic` (adds `manifestation` and `directionMode`).

## `UnknownSymbol`

Candidate groups that could not be matched to any known sigil or sign. Includes a `bestGuess` field (nullable) with the closest-match id and its confidence.

## `GlobalMetrics`

| Field | Type | Description |
| --- | --- | --- |
| `neatness` | `number` | Global stroke neatness (0-1) |
| `radialSymmetry` | `number` | Symmetry of symbol placement around the ring (0-1) |
| `instability` | `number` | Estimated handwriting/instability amount |

## Parser Warnings

| Value | Meaning |
| --- | --- |
| `no_ring_detected` | No enclosing ring found in the drawing |
| `ring_incomplete` | Ring does not form a closed loop |
| `unsupported_multiple_rings` | Multiple rings detected (only one supported) |
| `unsupported_nested_ring` | A ring inside another ring detected |
| `unsupported_multiple_sigils` | More than one sigil recognized (only one supported) |
| `missing_primary_sigil` | No sigil found at all |
| `center_unknown_contamination` | Unknown symbols near the ring center |
| `symbol_near_layer_boundary` | Symbol straddles a layer boundary zone |
| `symbol_contaminated` | Symbol strokes overlap/contaminated |
| `symbol_ambiguous` | Symbol could match multiple patterns |
| `symbol_messy` | Symbol neatness below acceptable threshold |

## JSON Example

```json
{
  "type": "GlyphAST",
  "version": "0.1.0",
  "ring": {
    "found": true,
    "center": { "x": 400, "y": 300 },
    "radius": 180,
    "complete": true,
    "activationEvent": false,
    "completeness": 0.98,
    "strokeIds": ["r1"],
    "gap": 0,
    "gapArcLength": 0,
    "coverageRatio": 0.92,
    "roundness": 0.96,
    "lineSmoothness": 0.88,
    "neatness": 0.87,
    "overdrawAmount": 0.05,
    "unsupportedMultipleRings": [],
    "unsupportedNestedRings": []
  },
  "candidates": [
    {
      "candidateId": "c1",
      "strokeIds": ["s1"],
      "rawStrokeCount": 1,
      "cleanedStrokeCount": 1,
      "bounds": { "minX": 385, "minY": 150, "maxX": 415, "maxY": 170 },
      "center": { "x": 400, "y": 160 },
      "radiusNorm": 0.78,
      "angleDeg": 0,
      "layer": "outer",
      "nearBoundary": false,
      "sizeNorm": 0.12,
      "lengthNorm": 0.25,
      "orientationDeg": 90,
      "directedOrientationDeg": 180,
      "radialFacing": "inward",
      "closedness": 0.3,
      "overdrawAmount": 0.01,
      "neatness": 0.92
    }
  ],
  "primarySigil": {
    "candidateId": "c2",
    "strokeIds": ["s2"],
    "id": "fire-sigil",
    "kind": "sigil",
    "recognized": true,
    "confidence": 0.91,
    "recognitionStatus": "valid",
    "element": "fire",
    "layer": "center",
    "radiusNorm": 0.05,
    "angleDeg": 0,
    "sizeNorm": 0.15,
    "lengthNorm": 0.40,
    "neatness": 0.90,
    "shape": {
      "elongation": 0.30,
      "dominantAxisStrength": 0.72,
      "strokeCount": 3,
      "closedness": 0.55
    },
    "semantic": {
      "force": 0.80,
      "focus": 0.65,
      "spread": 0.20,
      "range": 0.45,
      "lifetimeBias": 0.15
    }
  },
  "unsupportedMultipleSigils": [],
  "signs": [],
  "unknowns": [],
  "globalMetrics": {
    "neatness": 0.88,
    "radialSymmetry": 0.75,
    "instability": 0.12
  },
  "warnings": []
}
```
