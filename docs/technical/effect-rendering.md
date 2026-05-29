# Effect Rendering

## Architecture

The Glyph Weaver renderer (Milestone 5, `@glyph-weaver/renderer`) generates WebGL2 particle effects that
visualise spells based on the `SpellIR` intermediate representation. Rendering is organised into two
orthogonal layers — **element effects** (visual style tied to the spell's element) and **manifestation
effects** (spatial behaviour tied to the manifestation type). The `EffectEngine` orchestrates both
layers and manages the render lifecycle.

```
SpellIR → EffectEngine → { ElementEffect, ManifestationEffect } → WebGL2 Canvas
```

## Element Effects

Each element produces a distinct visual style with colour palettes tuned to the element's theme.
All element effects implement the `Effect` interface (`init` / `update` / `render` / `dispose`).

| Element | Class | Colours | Behaviour Highlights |
| --- | --- | --- | --- |
| Fire | `FireEffect` | Orange/red (`1.0, 0.4, 0.05`) | Upward stream when `gravity > 0`. Suspended flame cloud when `gravity < 0.3`. Flicker scales with `stability`. Particle size scales with `force`. |
| Water | `WaterEffect` | Blue/cyan (`0.2, 0.6, 1.0`) | Dual-pass: outer blob layer + inner core highlight layer. Blob/cluster mode when `gravity` is low. |
| Wind | `WindEffect` | Green/white (`0.6, 1.0, 0.7`) | Curved line particles with sinusoidal curl velocity. Thinner lines with higher `focus`. Faster speed with higher `force`. Near-zero gravity. |
| Earth | `EarthEffect` | Brown/gray (`0.5, 0.35, 0.15`) | Square/boulder-shaped heavy particles. Large damping (`0.92`). Size grows with lifetime. |
| Light | `LightEffect` | Golden/white (`1.0, 0.95, 0.7`) | Three-pass system: wide glow → middle beam → bright core. Lane cohesion pulls particles back to beam path. Lateral damping proportional to `focus`. |
| Dark | `DarkEffect` | Purple/black (`0.15, 0.0, 0.35`) | Reverse-glow (darkens area). Slow creeping movement. Particles drift back toward origin. |
| Lightning | `LightningEffect` | Blue-white (`0.8, 0.85, 1.0`) | Branching bolt segments with chain-branch algorithm. Rapid jitter inversely proportional to `stability`. Brief bright flashes. |
| Ice | `IceEffect` | Cyan/white (`0.75, 0.9, 1.0`) | Slow-growing crystalline structures with hexagonal arm symmetry. Freeze-spread: crystals spawn at random positions around origin. |
| Nature | `NatureEffect` | Green (`0.25, 0.75, 0.2`) | Vine/leaf tendrils with organic curl growth. Spiral spread pattern. Tendril growth speed and count proportional to `force`. |
| Arcane | `ArcaneEffect` | Purple/magenta (`0.55, 0.1, 0.75`) | Floating rune-like particles. Spiral orbital patterns around origin. Ethereal anti-gravity effect. |

## Manifestation Effects

Manifestation effects control the spatial behaviour of particles (projection shape, movement constraints,
boundary conditions). They layer on top of the element effect's visual style.

| Manifestation | Class | Spatial Behaviour |
| --- | --- | --- |
| Aura | `AuraEffect` | Ambient glow around the portal. Particles orbit in a ring around the origin. |
| Column | `ColumnEffect` | Particles travel in a beam/column along the spell's direction. Convergence compresses the column width proportional to `focus`. |
| Levitation | `LevitationEffect` | Anti-gravity hovering (negative gravity). Particles float with a sinusoidal hover wave. Orbital motion when `stability > 0.6` (balanced). |
| Convergence | `ConvergenceEffect` | Particles emit from lateral positions and converge toward the beam centreline. Compression tightness scales with `rigidity` (derived from `focus`). |
| Barrier | `BarrierEffect` | Particles form a protective shell/hemisphere around the portal. Equally-spaced segments along the shell circumference. |
| Projectile | `ProjectileEffect` | Particles launch as discrete projectiles along the spell's direction. Fixed launch interval with speed proportional to `force`. |
| Area | `AreaEffect` | Particles spread in an expanding circular zone. Radius grows from 0 to `maxRadius` (proportional to `spread` and `range`). |
| Shield | `ShieldEffect` | Particles form hexagonal/polygonal shield panels at equiangular positions. Panel count proportional to `focus`. |

## Layer Order

The `EffectEngine` renders manifestation effects first (behind), then element effects (in front), with
additive blending (`SRC_ALPHA`, `ONE_MINUS_SRC_ALPHA`). The clear colour is transparent black `(0,0,0,0)`
so the canvas can be composited over other content.

## Spell Transitions

When `EffectEngine.cast()` is called with a new `SpellIR` whose `signature` differs from the current spell,
a 0.5-second transition fades between spells rather than cutting instantly. During the transition,
the engine continues rendering the previous effect until the transition completes, then switches to
the new effect.

## Signature-Based Cache Invalidation

The `signature` field on `SpellIR` uniquely identifies each spell configuration. The engine checks
signatures to decide whether to instantiate a new effect or keep the current one. This avoids
unnecessary WebGL shader recompilation and particle system reallocation.

## Performance Considerations

- **Particle cap**: Default of 500 particles (`RendererConfig.particleCap`) to balance visual fidelity
  against GPU fill rate. Adjust per-device via `AppConfig.renderer.particleCap`.
- **WebGL2**: Uses WebGL2 exclusively for VAO support, instanced rendering potential, and GLSL 300 ES
  shader features. No WebGL1 fallback.
- **CPU particle simulation**: Particle physics (position, velocity, damping, gravity) are computed on
  the CPU in `ParticleSystem.update(dt)`. This avoids compute shader dependency and works on all
  WebGL2 platforms.
- **Scissor test per particle**: Individual particle rendering uses `gl.scissor()` to constrain
  draw regions, reducing fragment shader invocations.
- **Blending**: Additive blending (`gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)`) creates
  natural glow effects without post-processing passes.
- **Frame skipping guard**: `dt` is clamped to 100ms maximum to prevent physics explosion when
  the browser tab is backgrounded.

## WebGL Helpers

- `createWebGLContext(canvas)` — obtains WebGL2 context with high-performance preference, enables
  blending, sets transparent clear colour.
- `createShaderProgram(gl, vertexSrc, fragmentSrc)` — compiles vertex and fragment shaders, links
  program, handles errors with descriptive messages.
- `createQuad(gl)` — creates a VAO with full-screen quad geometry (position + texcoord attributes).

## Direction Mapping

The `direction.ts` module provides 3D-to-2D projection utilities:

- `screenDirection(direction3D)` — converts `Direction3D` to a normalised 2D screen-space vector.
- `applyTilt(x, y, tiltDeg)` — applies z-axis tilt rotation to simulate 3D perspective.
- `project3Dto2D(point3D, camera)` — conventional perspective projection with field-of-view camera.

## Portal Plane

The `portal-plane.ts` module handles ring-to-ellipse projection:

- `projectPortal(ring, direction?)` — converts a `RingCandidate` into a projected 2D ellipse with
  centre, radii, rotation, and tilt parameters.
- `portalOutDirection(direction)` — maps `Direction3D` to a unit-length 2D vector for particle
  emission direction.
