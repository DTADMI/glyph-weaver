# Dictionary Authoring — Glyph Weaver

## Overview

The dictionary system defines sigils, signs, and sample spells used by the parser and compiler. Each entry includes stroke templates for template-based recognition and semantic parameters for spell compilation.

## Entry Types

### SigilEntry

Sigils are central glyphs that determine a spell's element.

```json
{
  "id": "fire",
  "displayName": "Fire",
  "element": "fire",
  "allowedLayers": ["center", "middle", "outer"],
  "recognitionRotationInvariant": false,
  "semantic": {
    "force": 0.12,
    "focus": 0.04,
    "spread": 0.02,
    "range": 0.08,
    "lifetimeBias": 0.08
  },
  "strokeTemplate": {
    "sourceAspectRatio": 1,
    "strokes": [
      [
        { "x": 0.50, "y": 0.10 },
        { "x": 0.50, "y": 0.90 }
      ],
      [
        { "x": 0.30, "y": 0.35 },
        { "x": 0.70, "y": 0.35 }
      ]
    ]
  }
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique identifier (kebab-case) |
| `displayName` | string | Human-readable name |
| `element` | ElementId | One of: fire, water, wind, earth, light, dark, lightning, ice, nature, arcane |
| `allowedLayers` | LayerLabel[] | Where the sigil can appear: center, middle, outer |
| `recognitionRotationInvariant` | boolean | Whether the sigil can be drawn at any rotation |
| `semantic.force` | number | Force modifier for spell behavior |
| `semantic.focus` | number | Focus modifier |
| `semantic.spread` | number | Spread modifier |
| `semantic.range` | number | Range modifier |
| `semantic.lifetimeBias` | number | Duration bias |
| `strokeTemplate.sourceAspectRatio` | number | Aspect ratio of the source drawing area |
| `strokeTemplate.strokes` | StrokeTemplatePoint[][] | Array of stroke arrays, each stroke is an array of points in normalized [0-1] coordinates |

### SignEntry

Signs are peripheral glyphs that modify how the sigil manifests.

```json
{
  "id": "column",
  "displayName": "Column",
  "allowedLayers": ["middle", "outer"],
  "sourceNotes": "Column causes the magic of its glyph to manifest in a column or beam above the glyph.",
  "semantic": {
    "manifestation": "column",
    "directionMode": "orientation",
    "force": 0.10,
    "focus": 0.08,
    "spread": -0.04,
    "range": 0.12,
    "lifetimeBias": 0.02
  },
  "strokeTemplate": {
    "sourceAspectRatio": 1,
    "strokes": [
      [
        { "x": 0.50, "y": 0.05 },
        { "x": 0.50, "y": 0.95 }
      ]
    ]
  }
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique identifier (kebab-case) |
| `displayName` | string | Human-readable name |
| `allowedLayers` | LayerLabel[] | Where the sign can appear: middle, outer |
| `sourceNotes` | string? | Optional notes about the sign's origin or behavior |
| `semantic.manifestation` | ManifestationId | One of: aura, column, levitation, convergence, barrier, projectile, area, shield |
| `semantic.directionMode` | DirectionMode | One of: position, orientation, inward |
| `semantic.force` | number | Force modifier |
| `semantic.focus` | number | Focus modifier |
| `semantic.spread` | number | Spread modifier (negative values compress) |
| `semantic.range` | number | Range modifier |
| `semantic.lifetimeBias` | number | Duration bias |
| `strokeTemplate` | StrokeTemplate | Same structure as SigilEntry |

### SampleSpellEntry

Sample spells provide predefined spell layouts for the spell gallery and tutorials.

```json
{
  "id": "fire-column",
  "displayName": "Fire Column",
  "description": "Fire sigil with a column sign at the bottom. Produces a directional beam of fire.",
  "element": "fire",
  "manifestations": ["column"],
  "strokes": []
}
```

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Unique identifier (kebab-case) |
| `displayName` | string | Human-readable name |
| `description` | string | Description of what the spell does |
| `element` | ElementId | Primary element |
| `manifestations` | ManifestationId[] | List of manifestation effects |
| `strokes` | StrokeTemplatePoint[][] | Stroke data for rendering the sample (empty = use template defaults) |

## Validation

The dictionary is validated against Zod schemas on load. Invalid entries produce clear error messages indicating the field and reason. Run `pnpm test` to catch validation errors in CI.

## Adding a New Sigil

1. Add an entry to `packages/dictionary/src/sigils.ts`
2. Define `id`, `displayName`, `element`, `allowedLayers`, `semantic`, and `strokeTemplate`
3. Stroke templates use normalized coordinates: `{ x: 0.0..1.0, y: 0.0..1.0 }` where `(0,0)` is top-left
4. Each stroke is an array of points defining a polyline
5. Run `pnpm test` to validate

## Adding a New Sign

1. Add an entry to `packages/dictionary/src/signs.ts`
2. Define `id`, `displayName`, `allowedLayers`, `semantic` (including `manifestation` and `directionMode`), and `strokeTemplate`
3. Stroke templates follow the same normalized coordinate system as sigils
4. Run `pnpm test` to validate

## Adding a Sample Spell

1. Add an entry to `packages/dictionary/src/sample-spells.ts`
2. Define `id`, `displayName`, `description`, `element`, `manifestations`, and optionally `strokes`
3. If `strokes` is empty, the sample shows a template-only view
4. Run `pnpm test` to validate

## Coordinate System

All stroke templates use normalized coordinates `[0, 1]` where:
- `(0, 0)` is top-left
- `(1, 0)` is top-right
- `(0, 1)` is bottom-left
- `(1, 1)` is bottom-right

Points are scaled to the drawing canvas at recognition time based on the detected ring radius.

## Hot-Reload

During development, the dictionary loader supports watch mode via `watchDictionary()`, which returns an EventEmitter that fires events on dictionary changes (`add-sigil`, `remove-sigil`, `add-sign`, `remove-sign`, `change`). This enables instant feedback when authoring new sigil or sign templates.
