# Action Plan — Glyph Weaver

## Legend

- 🔴 Not started
- 🟡 In progress
- 🟢 Complete
- ⚪ Blocked
- 🔵 Deferred

## Milestone 1: Foundation

### 1.1 Project Infrastructure

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.1.1 | Initialize pnpm workspace (pnpm-workspace.yaml) | 🟢 | Monorepo with packages/ and apps/ |
| 1.1.2 | Configure TypeScript (tsconfig base + per-package) | 🟢 | Strict mode, composite projects |
| 1.1.3 | Set up Vitest for testing | 🟢 | 217 tests across 22 test files |
| 1.1.4 | Set up ESLint + Prettier | 🟢 | Flat config, .prettierrc |
| 1.1.5 | Create packages/core with shared types and contracts | 🟢 | GlyphAST, SpellIR, config types |
| 1.1.6 | Create AGENTS.md (project-specific) | 🟢 | Rules, hooks, skills, MCP |
| 1.1.7 | Create .githooks/pre-commit | 🟢 | typecheck, lint, test, build, format:check |
| 1.1.8 | Set up GitHub Actions CI | 🟢 | ubuntu-22.04, Node 22.22.3, pnpm |

### 1.2 Core Types & Contracts

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.2.1 | Define GlyphAST types | 🟢 | From glyph-ast.md spec |
| 1.2.2 | Define SpellIR types | 🟢 | From spell-ir.md spec |
| 1.2.3 | Define Dictionary types (sigils, signs, sample spells) | 🟢 | From dictionary-authoring.md |
| 1.2.4 | Define Config types | 🟢 | Recognition, renderer, compiler config |
| 1.2.5 | Define stroke/canvas types | 🟢 | Point, Stroke, Bounds, etc. |
| 1.2.6 | Create Zod schemas for all types | 🟢 | Runtime validation |

### 1.3 Dictionary System

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.3.1 | Create sigils dictionary (fire, water, wind, earth, light) | 🟢 | Port templates from reference |
| 1.3.2 | Create signs dictionary (column, levitation, convergence) | 🟢 | Port templates from reference |
| 1.3.3 | Create sample spells dictionary | 🟢 | 8 reference layouts |
| 1.3.4 | Dictionary loader with hot-reload | 🟢 | Watch mode via EventEmitter |
| 1.3.5 | Dictionary validation (Zod schemas) | 🟢 | On load + CI check |
| 1.3.6 | Dictionary authoring documentation | 🟢 | docs/technical/dictionary-authoring.md |

## Milestone 2: Parser

### 2.1 Stroke Processing

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.1.1 | Stroke capture and normalization | 🟢 | normalizeStroke, smoothStroke |
| 2.1.2 | Stroke cleanup (simplify, smooth, merge) | 🟢 | RDP simplification |
| 2.1.3 | Connected components analysis | 🟢 | Union-find based grouping |
| 2.1.4 | Stroke segmentation (spatial clustering) | 🟢 | DBSCAN-like clustering |

### 2.2 Ring Detection

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.2.1 | Single ring detection | 🟢 | Least-squares circle fit |
| 2.2.2 | Ring completeness detection | 🟢 | Angular coverage analysis |
| 2.2.3 | Ring quality metrics (roundness, smoothness, neatness) | 🟢 | Multi-metric scoring |
| 2.2.4 | Multi-ring detection | 🟢 | Additional ring candidate detection |
| 2.2.5 | Activation event detection | 🟢 | Open to closed transition |

### 2.3 Symbol Recognition

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.3.1 | Template-based matching (bitmap overlap) | 🟢 | Rasterize + IoU scoring |
| 2.3.2 | Rotation-invariant matching for signs | 🟢 | Canonical pose at 270 degree |
| 2.3.3 | Layer detection (center, middle, outer) | 🟢 | Radial distance analysis |
| 2.3.4 | Confidence scoring | 🟢 | Multi-factor weighted scoring |
| 2.3.5 | Ambiguity and contamination detection | 🟢 | Close match handling |

### 2.4 GlyphAST Output

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.4.1 | Ring output serialization | 🟢 | Full ring data |
| 2.4.2 | Candidate output serialization | 🟢 | Position, metrics, classification |
| 2.4.3 | Recognized symbol output | 🟢 | Sigil + sign data |
| 2.4.4 | Unknowns and warnings output | 🟢 | Diagnostics |
| 2.4.5 | Parser-level metrics | 🟢 | Neatness, symmetry, instability |

## Milestone 3: Compiler

### 3.1 Single-Element Compiler

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.1.1 | Primary sigil extraction | 🟢 | One sigil to element |
| 3.1.2 | Sign aggregation | 🟢 | Manifestation compilation |
| 3.1.3 | Parameter computation (force, spread, focus, etc.) | 🟢 | Base + sigil + sign deltas |
| 3.1.4 | Direction computation | 🟢 | Position, orientation, inward modes |
| 3.1.5 | Quality and stability scoring | 🟢 | Ring + sigil + sign neatness |
| 3.1.6 | Duration calculation | 🟢 | Quality-based lifetime |

### 3.2 Multi-Element Compiler

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.2.1 | Multi-sigil support design | 🟢 | Element mixing rules |
| 3.2.2 | Element combination logic | 🟢 | 15+ element pair combinations |
| 3.2.3 | Multi-ring compilation | 🟢 | Nested + linked ring semantics |

### 3.3 SpellIR Output

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.3.1 | SpellIR serialization | 🟢 | Full behavior model |
| 3.3.2 | Invalid spell handling | 🟢 | Graceful degradation |
| 3.3.3 | Compiler warnings | 🟢 | EN/FR diagnostic messages |
| 3.3.4 | Spell signature generation | 🟢 | Identity string for render cache |

## Milestone 4: DSL

### 4.1 WHA-DSL Design

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 4.1.1 | DSL grammar specification | 🟢 | EBNF comments + docs |
| 4.1.2 | Lexer implementation | 🟢 | 14 token types, full tokenizer |
| 4.1.3 | Parser implementation | 🟢 | Recursive descent, error recovery |
| 4.1.4 | DSL to GlyphAST compiler | 🟢 | compileDSL() with error collection |
| 4.1.5 | GlyphAST to DSL decompiler | 🟢 | Bidirectional roundtrip |

### 4.2 DSL Features

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 4.2.1 | Sigil declaration syntax | 🟢 | `sigil fire { force: 0.12 }` |
| 4.2.2 | Sign declaration syntax | 🟢 | `sign column at 90deg` |
| 4.2.3 | Ring declaration syntax | 🟢 | `ring { radius: 200 }` |
| 4.2.4 | Parameter overrides | 🟢 | Named parameter blocks |
| 4.2.5 | Import/include system | 🟢 | `import "fire-blast.wha"` |

## Milestone 5: Renderer

### 5.1 WebGL Core

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.1.1 | WebGL 2.0 context setup | 🟢 | Canvas initialization |
| 5.1.2 | Particle system framework | 🟢 | emit/update/render/dispose cycle |
| 5.1.3 | Portal plane projection | 🟢 | 2D ring to 3D ellipse |
| 5.1.4 | Direction mapping | 🟢 | Paper-local 3D to screen 2D |

### 5.2 Element Effects

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.2.1 | Fire effect | 🟢 | Glowing particles, stream/suspended |
| 5.2.2 | Water effect | 🟢 | Core + highlight passes |
| 5.2.3 | Wind effect | 🟢 | Curved line particles |
| 5.2.4 | Earth effect | 🟢 | Square particles, slow/heavy |
| 5.2.5 | Light effect | 🟢 | 3-pass beam with trails |
| 5.2.6 | Additional elements (dark, lightning, ice, nature, arcane) | 🟢 | 5 additional element effects |

### 5.3 Manifestation Effects

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.3.1 | Column manifestation | 🟢 | Directional beam/stream |
| 5.3.2 | Levitation manifestation | 🟢 | Suspended particles |
| 5.3.3 | Convergence manifestation | 🟢 | Compression + focus |
| 5.3.4 | Aura (default) | 🟢 | Ambient orbital effect |
| 5.3.5 | Additional (barrier, projectile, area, shield) | 🟢 | 4 additional manifestations |

## Milestone 6: UI

### 6.1 App Shell

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.1.1 | Next.js app setup | 🟢 | App Router, Next.js 15 |
| 6.1.2 | Layout components (header, sidebar, canvas area) | 🟢 | Responsive, mobile-first |
| 6.1.3 | Theme system (dark default) | 🟢 | CSS variables, light/dark |
| 6.1.4 | i18n setup (EN/FR) | 🟢 | React Context, FR default |
| 6.1.5 | Keyboard shortcuts system | 🟢 | 15 shortcuts, handler hook |

### 6.2 Drawing Canvas

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.2.1 | Paper-textured drawing canvas | 🟢 | HTML5 Canvas + procedural paper |
| 6.2.2 | Effects overlay canvas (WebGL) | 🟢 | Layered compositing |
| 6.2.3 | Drawing tools (pen, eraser, select) | 🟢 | Tool palette with SVG icons |
| 6.2.4 | Brush settings (size, opacity, color) | 🟢 | Configurable panel |
| 6.2.5 | Undo/redo | 🟢 | Full snapshot history stack |
| 6.2.6 | Touch and pen support | 🟢 | Pointer Events, pressure sensitivity |

### 6.3 Panels

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.3.1 | Dictionary panel (sigils, signs, samples) | 🟢 | Searchable, 3 tabs |
| 6.3.2 | Diagnostics panel (parser, AST, IR) | 🟢 | Collapsible, copyable |
| 6.3.3 | Spell state display | 🟢 | Active/prepared/invalid, stat bars |
| 6.3.4 | Settings panel | 🟢 | Recognition, renderer, theme, lang config |

## Milestone 7: Tools & Polish

### 7.1 Reference Tools

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.1.1 | Stroke template maker | 🟢 | Canvas recording, JSON export |
| 7.1.2 | Stroke template viewer | 🟢 | JSON input, visual preview |
| 7.1.3 | Sigil/sign detector lab | 🟢 | Recognition pipeline with scores |
| 7.1.4 | Spell effect lab | 🟢 | Parameter sliders, live preview |

### 7.2 Import/Export

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.2.1 | SVG export | 🟢 | Annotated vector output |
| 7.2.2 | PNG export | 🟢 | Canvas capture + compositing |
| 7.2.3 | JSON project export/import | 🟢 | Full project serialization |
| 7.2.4 | Dictionary import/export | 🟢 | Merge support, validation |

### 7.3 Polish

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.3.1 | Loading states and skeletons | 🟢 | Spinner + skeleton components |
| 7.3.2 | Error boundaries | 🟢 | Fallback UI, retry button |
| 7.3.3 | Performance optimization | 🟢 | debounce, throttle, FPS monitor |
| 7.3.4 | Accessibility audit | 🔵 | WCAG 2.1 AA (deferred) |
| 7.3.5 | Onboarding tutorial | 🔵 | Phase 2 |
| 7.3.6 | PWA support | 🔵 | Phase 2 |

## Additional Completed Features

| Feature | Status | Notes |
| --- | --- | --- |
| Feature flags | 🟢 | enableMultiRing, enableMultiSigil, enableDSL, enableExperimentalEffects, enableLLMRecognition |
| Project persistence | 🟢 | localStorage adapter, save slots, auto-save |
| Performance monitor | 🟢 | FPS, frame time, memory tracking |
| Dictionary authoring docs | 🟢 | Full guide with examples |
| WHA-DSL reference docs | 🟢 | Language spec with grammar and examples |
| Effect rendering docs | 🟢 | Architecture and element/manifestation reference |
| Performance optimization docs | 🟢 | SSR strategy, caching, code splitting |
| ESLint + Prettier config | 🟢 | Flat config, consistent formatting |
| CI/CD pipeline | 🟢 | GitHub Actions, ubuntu-22.04 |
| Zustand state management | 🟢 | Full app store with undo/redo |
| Paper texture generation | 🟢 | Procedural noise on canvas |
| Custom cursors | 🟢 | SVG cursors per tool type |

## Test Summary

| Package | Tests | Status |
| --- | --- | --- |
| @glyph-weaver/core | 4 | 🟢 |
| @glyph-weaver/dictionary | 7 | 🟢 |
| @glyph-weaver/parser | 39 | 🟢 |
| @glyph-weaver/compiler | 28 | 🟢 |
| @glyph-weaver/dsl | 33 | 🟢 |
| @glyph-weaver/renderer | 23 | 🟢 |
| @glyph-weaver/ui | 38 | 🟢 |
| @glyph-weaver/tools | 45 | 🟢 |
| **Total** | **217** | 🟢 |
