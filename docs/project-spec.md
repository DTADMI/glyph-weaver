# Glyph Weaver — Project Specification

## Overview

Glyph Weaver is a tool for crafting and manipulating symbolic glyph systems, runic alphabets, and custom character sets. Inspired by the magic system in *Witch Hat Atelier* (Kamome Shirahama / Kodansha) and the fan-made spell simulator by ytnrvdf (288 stars, MIT), Glyph Weaver provides a programmable glyph engine with a domain-specific language, multi-ring compilation, visual rendering, and extensible dictionary authoring.

## Source Material Research

### Witch Hat Atelier — The Manga (Source Canon)

- **Creator**: Kamome Shirahama (Kodansha, 2016–present, 16 volumes, 7.5M+ copies)
- **Magic System**: Magic is performed by drawing precise glyphs with "conjuring ink" on special paper. The act of drawing IS the spell.
- **Core Concepts**:
  - **Sigils** (central glyphs): Determine the spell's element/type. Drawn in the center of a spell circle.
  - **Signs** (peripheral glyphs): Modify how the sigil manifests (direction, form, intensity). Placed around the ring.
  - **Spell Circle / Ring**: The enclosing boundary. Must be closed to activate. An open ring is "prepared" but not cast.
  - **Neatness**: Quality and precision matter. Messy glyphs still work but produce weaker, shorter, unstable effects.
  - **Multi-layer composition**: Nested rings, multiple sigils, and complex sign arrangements exist in canon.
  - **Conjuring Ink**: Magical medium. The ink itself is the catalyst.
  - **Day of the Pact**: Institutional control of magic knowledge by the Great Hall of Witches.
  - **Brimmed Caps**: Rogue witches who reject institutional control and use forbidden magic.

- **Artistic Philosophy**: Shirahama draws with traditional wooden ink pens on paper. The art draws from Renaissance art, Art Nouveau, Art Deco, American comics, and bande dessinée. The series is praised for diversity in casting and themes of accessibility, education, and self-discovery.

### Spell Simulator (ytnrvdf/wha-spell-simulator) — Reference Implementation

- **Stack**: JavaScript, Vite, HTML5 Canvas, Node.js test suite, Playwright E2E
- **Architecture**: Parser → GlyphAST → Compiler → SpellIR → Renderer pipeline
- **Features Implemented**:
  - Freehand drawing on paper-textured canvas
  - Ring detection (completeness, roundness, neatness scoring)
  - Template-based stroke recognition for sigils and signs
  - Parser diagnostics with confidence scoring
  - Compiler producing SpellIR (behavior model)
  - Canvas particle effects (fire, water, wind, earth, light)
  - Sign manifestations: column, levitation, convergence
  - Direction modes: position-based, orientation-based, inward
  - Quality/stability/force/spread/focus/range/duration parameters
  - Reference tools: stroke template maker, viewer, detector lab, effect lab
  - Comprehensive test suite (unit, integration, benchmark, E2E)
  - GlyphAST and SpellIR contract documentation

- **Limitations / Gaps Identified**:
  1. Single ring only — no nested or multi-ring spells
  2. Single sigil only — no multi-element mixing
  3. Template-based recognition is fragile and limited (5 sigils, 3 signs)
  4. No DSL for defining spells programmatically
  5. No undo/redo stack (single-step undo only)
  6. No persistence / save / load
  7. No multi-user or collaboration
  8. No export (PNG, SVG, JSON)
  9. No sound effects or haptic feedback
  10. No mobile/touch optimization
  11. No i18n (English only)
  12. No accessibility features (screen reader, keyboard nav)
  13. No animation customization for end users
  14. No proper GPU-accelerated rendering (CPU canvas only)
  15. No offline/PWA support
  16. No dictionary import/export for community sharing
  17. No spell history or gallery
  18. No guided tutorial or onboarding
  19. Recognition can't handle cursive/flowing strokes well
  20. No procedural glyph generation

### ppabba101 Fork — Additional Features

- WHA-DSL primitives (domain-specific language for defining spells textually)
- LLM-as-judge glyph interpretation using SambaNova (streaming)
- Integration tests with real LLM judge

## Product Vision

Glyph Weaver should be the definitive tool for creating, editing, and simulating symbolic glyph systems. Beyond Witch Hat Atelier fan functionality, it should be a general-purpose platform for:

1. **Glyph System Design**: Define custom sigils, signs, and glyph systems with a DSL
2. **Interactive Drawing**: Freehand drawing, procedural generation, and template libraries
3. **Real-time Compilation**: Parse, compile, and render glyphs with instant feedback
4. **Community Sharing**: Import/export dictionaries, share spell libraries
5. **Educational Tools**: Tutorials, guided drawing, reference overlays
6. **Creative Export**: SVG, PNG, JSON, GLTF for use in games, art, and apps

## Feature Catalog

### Core Engine (Phase 1)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Multi-ring compilation | P0 | Not started | Nested rings, linked rings |
| Multi-sigil support | P0 | Not started | Element mixing, combining |
| Extensible dictionary system | P0 | Not started | JSON/YAML authoring, hot-reload |
| WHA-DSL (Domain-Specific Language) | P0 | Not started | Textual spell definition language |
| Canvas renderer (GPU-accelerated) | P0 | Not started | WebGL/WebGPU particle system |
| Undo/redo stack | P1 | Not started | Full history with snapshots |
| Project persistence | P1 | Not started | Save/load to localStorage, file |
| Export pipeline | P1 | Not started | SVG, PNG, JSON, GLTF |
| TypeScript rewrite | P0 | Not started | Full type safety |

### Drawing & Recognition (Phase 1)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Freehand canvas with paper texture | P0 | Not started | HTML5 Canvas + WebGL overlay |
| Ring detection (multi-ring) | P0 | Not started | Topological analysis |
| ML-enhanced recognition | P1 | Not started | TensorFlow.js or ONNX for stroke matching |
| Stroke order preservation | P1 | Not started | Temporal stroke data |
| Layer system (center, middle, outer) | P0 | Not started | Radial layer detection |
| Symbol grouping and segmentation | P0 | Not started | Connected components + spatial clustering |
| Neatness / quality scoring | P1 | Not started | Multi-metric evaluation |
| Pressure sensitivity | P2 | Not started | Pointer Events API |
| Touch and pen optimization | P1 | Not started | Mobile-first responsive |

### Compiler & DSL (Phase 1-2)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Parser: Strokes → Candidates → Recognitions | P0 | Not started | Pipeline architecture |
| GlyphAST output | P0 | Not started | Structured parse result |
| Compiler: GlyphAST → SpellIR | P0 | Not started | Multi-sigil, multi-ring |
| SpellIR output contract | P0 | Not started | Behavior model |
| WHA-DSL lexer/parser/compiler | P0 | Not started | PEG or hand-written parser |
| DSL → GlyphAST bidirectional | P1 | Not started | Draw → DSL, DSL → Draw |
| Effect parameter system | P1 | Not started | force, spread, focus, range, etc. |
| Runtime type validation | P0 | Not started | Zod or similar |
| Compiler warnings and diagnostics | P1 | Not started | User-facing error messages |

### Visual Effects (Phase 2)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Element effects (fire, water, wind, earth, light, dark, lightning, ice, nature, arcane) | P0 | Not started | WebGL particle systems |
| Manifestation effects (column, levitation, convergence, aura, barrier, projectile, area, shield) | P0 | Not started | Composable effects |
| Directional projection (3D paper plane) | P1 | Not started | z-axis tilt |
| Spell quality visual feedback | P1 | Not started | Stability, flicker, glow intensity |
| Effect customization (color, speed, density) | P2 | Not started | User-configurable |
| Animation presets and timelines | P2 | Not started | Keyframe system |

### UI/UX (Phase 1-2)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Responsive layout (320px–4K) | P0 | Not started | Mobile-first |
| Dark/light theme | P1 | Not started | CSS variables |
| i18n (EN/FR minimum) | P0 | Not started | React Context pattern |
| Undo/redo UI | P1 | Not started | Toolbar buttons + keyboard shortcuts |
| Dictionary panel with search | P1 | Not started | Sigil/sign browser |
| Sample spells gallery | P1 | Not started | Reference drawings |
| Diagnostics panel (collapsible) | P1 | Not started | Parser, AST, IR views |
| Keyboard shortcuts | P1 | Not started | Full shortcut map |
| Accessibility (ARIA, keyboard nav, screen reader) | P2 | Not started | WCAG 2.1 AA |
| Onboarding / tutorial | P2 | Not started | Interactive walkthrough |
| Tool settings panel | P2 | Not started | Brush size, ink color, opacity |
| Performance monitor | P3 | Not started | FPS, render time, memory |

### Community & Sharing (Phase 3)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| Dictionary import/export | P2 | Not started | JSON with validation |
| Spell gallery (public) | P3 | Not started | Share via URL |
| Community dictionary hub | P3 | Not started | GitHub-based registry |
| Embeddable widget | P3 | Not started | `<glyph-weaver>` web component |

### Technical Infrastructure (Phase 1)

| Feature | Priority | Status | Notes |
| --- | --- | --- | --- |
| TypeScript throughout | P0 | Not started | Strict mode |
| Monorepo structure (packages/) | P0 | Not started | Core, UI, DSL, Renderer |
| Test suite (unit, integration, E2E, benchmarks) | P0 | Not started | Vitest + Playwright |
| CI/CD pipeline | P0 | Not started | GitHub Actions |
| PWA support | P2 | Not started | Offline-first |
| Telemetry (opt-in) | P3 | Not started | Basic usage stats |
| Feature flags | P1 | Not started | Growth/experimental gating |

## Architecture

### High-Level Pipeline

```
Drawing Canvas → Parser → GlyphAST → Compiler → SpellIR → Renderer → Effects Canvas
                    ↑                        ↑
              Dictionary              DSL Source Code
              (sigils, signs)    (textual spell definitions)
```

### Package Structure

```
glyph-weaver/
  packages/
    core/           # Shared types, config, contracts
    parser/         # Stroke → GlyphAST pipeline
    compiler/       # GlyphAST → SpellIR
    renderer/       # WebGL/Canvas visual effects
    dsl/            # WHA-DSL lexer/parser/compiler
    dictionary/     # Sigil/sign definitions, authoring
    ui/             # React components, canvas shell
    tools/          # Stroke template maker, effect lab
  apps/
    web/            # Next.js frontend
    desktop/        # Tauri or Electron (future)
  docs/             # Documentation
  tests/            # Integration and E2E tests
```

### Data Flow

```
User Input (mouse/touch/pen)
    ↓
Stroke Capture → Point array [{x, y, t, pressure}]
    ↓
Parser Pipeline:
  1. Stroke cleanup (dilation, simplify, merge)
  2. Ring detection (Hough-like topological analysis)
  3. Symbol segmentation (connected components + spatial clustering)
  4. Symbol classification (dictionary matching via template or ML)
  5. Layer assignment (center, middle, outer)
    ↓
GlyphAST { ring, candidates, primarySigil, signs, unknowns, warnings }
    ↓
Compiler:
  1. Validate structure (ring, sigil presence)
  2. Apply semantic rules (manifestations, direction, force, etc.)
  3. Compute derived params (quality, stability, duration)
    ↓
SpellIR { valid, active, element, manifestations, direction, params }
    ↓
Renderer:
  1. Portal plane projection (2D ring → 3D ellipse)
  2. Particle system initialization
  3. Frame-by-frame animation
    ↓
Effects Canvas output
```

## Technical Requirements

### Platform
- **Primary**: Web (Next.js 15+, React 19+)
- **Secondary**: Desktop (Tauri 2.x, future)
- **Mobile**: Responsive PWA (future)

### Runtime
- Node.js 22.22.3 LTS
- pnpm 10.33.4
- TypeScript 5.x strict mode

### Key Libraries
- **Canvas Rendering**: WebGL 2.0 / WebGPU (via three.js or custom)
- **UI Framework**: React 19 + Tailwind CSS
- **State Management**: Zustand or Jotai
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **DSL Parsing**: Peggy (PEG.js successor) or Ohm
- **ML Recognition**: TensorFlow.js or ONNX Runtime Web (optional)

### Performance Targets
- 60 FPS rendering at 1080p
- < 16ms parse+compile time
- < 200ms initial load (code-split)
- < 50MB memory footprint
- PWA offline support

### Browser Support
- Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- Mobile Safari 17+, Chrome Android 120+

## UI/UX Design Principles

1. **Mobile-First**: All features must work at 320px width
2. **Progressive Disclosure**: Complex features revealed through tabs, accordions, tooltips
3. **Immediate Feedback**: Visual response within 100ms of every action
4. **Error Recovery**: Undo always available. Never lose user work.
5. **Accessibility**: WCAG 2.1 AA minimum. Full keyboard navigation.
6. **i18n First**: Every string resolves through i18n. Default FR (Quebec French).
7. **Dark Mode Default**: Witch Hat Atelier aesthetic (dark, warm, magical)
8. **No Dead-Ends**: Every error state provides a recovery path

## Visual Design Language

- **Inspired by**: Witch Hat Atelier manga art style (Renaissance + Art Nouveau + ink drawing)
- **Color Palette**: Warm golds, deep purples, parchment cream, conjuring ink blue
- **Typography**: Serif for headings (magical/grimoire feel), sans-serif for UI
- **Textures**: Paper grain, ink bleed, magical glow
- **Animations**: Subtle magical particle effects, ink spreading transitions

## Assets Required

| Asset | Type | Source |
| --- | --- | --- |
| Paper texture | SVG/PNG | Generated or public domain |
| Sigil templates (5 core) | JSON stroke data | Dictionary authoring |
| Sign templates (3 core) | JSON stroke data | Dictionary authoring |
| Sample spell layouts (8+) | JSON stroke data | Dictionary authoring |
| Magic sound effects | Audio | Create or license (Phase 3) |
| App icon / favicon | SVG | Custom design (Phase 2) |
| Loading animation | SVG/Lottie | Custom (Phase 2) |

## Gap Analysis vs. Reference Implementation

### Critical Gaps to Close

1. **TypeScript**: Reference is pure JS. Glyph Weaver must be TypeScript.
2. **Multi-ring**: Reference supports 1 ring. Must support nested and linked rings.
3. **Multi-sigil**: Reference supports 1 sigil. Must support multi-element spells.
4. **DSL**: Reference has no DSL. WHA-DSL is a key differentiator.
5. **GPU Rendering**: Reference uses CPU Canvas. Must use WebGL/WebGPU.
6. **Persistence**: Reference has no save/load. Must have project persistence.
7. **Export**: Reference has no export. Must support SVG, PNG, JSON.
8. **Mobile**: Reference is desktop-only. Must be responsive.
9. **i18n**: Reference is English only. Must support EN/FR minimum.
10. **Accessibility**: Reference has no a11y. Must meet WCAG 2.1 AA.

### Strengths to Preserve

1. **Parser → AST → IR → Renderer pipeline** (proven architecture)
2. **Dictionary authoring docs** (excellent contribution guide)
3. **Stroke template maker** (practical tool)
4. **Comprehensive documentation** (contracts, play rules, authoring)
5. **Test infrastructure** (unit, integration, bench, E2E)

## Reference Implementations

| Project | URL | Stars | License | Stack |
| --- | --- | --- | --- | --- |
| ytnrvdf/wha-spell-simulator | https://github.com/ytnrvdf/wha-spell-simulator | 288 | MIT | JS, Vite, Canvas |
| ppabba101/wha-spell-simulator | https://github.com/ppabba101/wha-spell-simulator | 0 | — | JS, SambaNova |
| Witch Hat Atelier (manga) | Kodansha | 7.5M copies | — | Print |
| Witch Hat Atelier (anime) | Bug Films, April 2026 | — | — | Crunchyroll |

## Compliance Notes

- **Fan Project Notice**: Must clearly state unofficial, not affiliated with official creators
- **Copyright**: Sigil/sign designs should be original or fan-reference. Do not reproduce copyrighted manga panels.
- **Trademark**: Do not use "Witch Hat Atelier" in product name or branding.
- **AGENTS.md Rules**: Follow all cross-project rules (Node 22.22.3, pnpm 10.33.4, TypeScript, i18n FR default, feature flags, encoding rules, content integrity, etc.)
