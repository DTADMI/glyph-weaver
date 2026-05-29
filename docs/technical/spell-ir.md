# SpellIR Contract

## Purpose

The SpellIR is the compiled spell behavior representation produced by the compiler pipeline from a parsed `GlyphAST`. It encodes runtime state (active, prepared, invalid), the resolved element and manifestation profiles, spatial direction, all tunable spell parameters (force, spread, focus, range, duration, stability, quality), and any compiler warnings.

## State Fields

| Field | Type | Description |
| --- | --- | --- |
| `type` | `'SpellIR'` | Discriminant literal |
| `valid` | `boolean` | Whether the spell compiled into a usable result |
| `active` | `boolean` | Whether the spell is currently active (emitting effects) |
| `prepared` | `boolean` | Whether the spell is in a prepared (ready-to-activate) state |
| `status` | `string` | Human-readable status label |
| `activatedAt` | `number \| null` | Timestamp (ms) of activation, or null if not active |

## State Combinations

| `valid` | `active` | `prepared` | Meaning |
| --- | --- | --- | --- |
| `false` | `false` | `false` | Compilation failed — invalid spell |
| `true` | `false` | `false` | Compiled but not armed (rare intermediate state) |
| `true` | `false` | `true` | Spell compiled and armed, awaiting activation |
| `true` | `true` | `false` | Spell is currently active (left prepared after activation) |
| `true` | `true` | `true` | Spell is active and re-armable (unusual) |

## Behavior Fields

| Field | Type | Description |
| --- | --- | --- |
| `element` | `ElementId \| null` | Resolved element (null if compilation failed) |
| `elementConfidence` | `number` | Confidence in the element assignment (0-1) |
| `primarySizeNorm` | `number` | Normalized size of the primary sigil |
| `effectScale` | `number` | Global effect scale multiplier |
| `primaryManifestation` | `ManifestationId \| 'none'` | Primary manifestation type |
| `manifestations` | `Record<string, AnyManifestationProfile>` | All manifestation profiles keyed by type |
| `direction` | `Direction3D` | Compass direction the spell faces |
| `directionCoherence` | `number` | Agreement among direction sources (0-1) |
| `gravity` | `number` | Applied gravity modifier |
| `force` | `number` | Spell force (0-1) |
| `spread` | `number` | Spell spread/area (0-1) |
| `focus` | `number` | Spell focus/precision (0-1) |
| `range` | `number` | Effective range (0-1) |
| `duration` | `number` | Spell lifetime in seconds |
| `stability` | `number` | Spell stability (0-1, higher = less chaotic) |
| `quality` | `number` | Overall spell quality score (0-1) |
| `neatness` | `number` | Inherited neatness from the AST |
| `warnings` | `Array<ParserWarning \| CompilerWarning>` | Combined parser and compiler warnings |
| `signature` | `string` | Unique spell content hash for caching/dedup |

## Direction (`Direction3D`)

| Field | Type | Description |
| --- | --- | --- |
| `x` | `number` | Horizontal direction component |
| `y` | `number` | Vertical direction component |
| `z` | `number` | Depth/forward direction component |
| `xTiltDeg` | `number` | Tilt angle around the x-axis (degrees) |
| `yTiltDeg` | `number` | Tilt angle around the y-axis (degrees) |
| `tiltFromZDeg` | `number` | Total angular deviation from the z-axis |

## Manifestation Profile Types

### `AuraProfile`
Omnidirectional energy emission around the caster.
Fields: `type: 'aura'`, `strength`

### `ColumnProfile`
A vertical column of elemental energy.
Fields: `type: 'column'`, `strength`

### `LevitationProfile`
Lift/float effect on a target.
Fields: `type: 'levitation'`, `strength`

### `ConvergenceProfile`
Energy converges to a point.
Fields: `type: 'convergence'`, `strength`, `point (x, y)`, `radius`, `rigidity`

### `BarrierProfile`
A defensive wall or barrier.
Fields: `type: 'barrier'`, `strength`

### `ProjectileProfile`
A launched projectile of elemental energy.
Fields: `type: 'projectile'`, `strength`

## Invalid Spell Defaults

When `valid === false`, the following defaults apply:

| Field | Default |
| --- | --- |
| `element` | `null` |
| `elementConfidence` | `0` |
| `primarySizeNorm` | `0` |
| `effectScale` | `0` |
| `primaryManifestation` | `'none'` |
| `manifestations` | `{}` |
| `direction` | `{ x: 0, y: -1, z: 0, xTiltDeg: 0, yTiltDeg: 0, tiltFromZDeg: 0 }` |
| `force`, `spread`, `focus`, `range` | `0` |
| `duration` | `0` |
| `stability`, `quality`, `neatness` | `0` |
| `status` | `'invalid'` |
| `signature` | `'@@invalid@@'` |

## JSON Example

```json
{
  "type": "SpellIR",
  "valid": true,
  "active": false,
  "prepared": true,
  "status": "prepared",
  "activatedAt": null,
  "element": "fire",
  "elementConfidence": 0.91,
  "primarySizeNorm": 0.15,
  "effectScale": 1.5,
  "primaryManifestation": "projectile",
  "manifestations": {
    "projectile": {
      "type": "projectile",
      "strength": 0.80
    }
  },
  "direction": {
    "x": 0.12,
    "y": -0.85,
    "z": 0.50,
    "xTiltDeg": 8,
    "yTiltDeg": -5,
    "tiltFromZDeg": 60
  },
  "directionCoherence": 0.88,
  "gravity": 1.0,
  "force": 0.80,
  "spread": 0.20,
  "focus": 0.65,
  "range": 0.45,
  "duration": 4.0,
  "stability": 0.78,
  "quality": 0.83,
  "neatness": 0.88,
  "warnings": [],
  "signature": "a1b2c3d4e5f6..."
}
```
