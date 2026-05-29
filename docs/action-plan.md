# Action Plan — Glyph Weaver

## Legend

- 🔴 Not started
- 🟡 In progress
- 🟢 Complete
- ⚪ Blocked
- 🔵 Deferred

## Milestone 1: Foundation (Current)

### 1.1 Project Infrastructure

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.1.1 | Initialize pnpm workspace (pnpm-workspace.yaml) | 🔴 | Monorepo with packages/ and apps/ |
| 1.1.2 | Configure TypeScript (tsconfig base + per-package) | 🔴 | Strict mode, composite projects |
| 1.1.3 | Set up Vitest for testing | 🔴 | Unit + integration |
| 1.1.4 | Set up ESLint + Prettier | 🔴 | Shared config |
| 1.1.5 | Create packages/core with shared types and contracts | 🔴 | GlyphAST, SpellIR, config types |
| 1.1.6 | Create AGENTS.md (project-specific) | 🔴 | Rules, hooks, skills, MCP |
| 1.1.7 | Create .githooks/pre-commit | 🔴 | typecheck, lint, test, build |
| 1.1.8 | Set up GitHub Actions CI | 🔴 | ubuntu-22.04, Node 22 |

### 1.2 Core Types & Contracts

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.2.1 | Define GlyphAST types | 🔴 | From glyph-ast.md spec |
| 1.2.2 | Define SpellIR types | 🔴 | From spell-ir.md spec |
| 1.2.3 | Define Dictionary types (sigils, signs, sample spells) | 🔴 | From dictionary-authoring.md |
| 1.2.4 | Define Config types | 🔴 | Recognition, renderer, compiler config |
| 1.2.5 | Define stroke/canvas types | 🔴 | Point, Stroke, Bounds, etc. |
| 1.2.6 | Create Zod schemas for all types | 🔴 | Runtime validation |

### 1.3 Dictionary System

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 1.3.1 | Create sigils dictionary (fire, water, wind, earth, light) | 🔴 | Port templates from reference |
| 1.3.2 | Create signs dictionary (column, levitation, convergence) | 🔴 | Port templates from reference |
| 1.3.3 | Create sample spells dictionary | 🔴 | 8+ reference layouts |
| 1.3.4 | Dictionary loader with hot-reload | 🔴 | Watch mode for dev |
| 1.3.5 | Dictionary validation (Zod schemas) | 🔴 | On load + CI check |
| 1.3.6 | Dictionary authoring documentation | 🔴 | Port from reference, extend |

## Milestone 2: Parser (Weeks 2-3)

### 2.1 Stroke Processing

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.1.1 | Stroke capture and normalization | 🔴 | Pointer Events API |
| 2.1.2 | Stroke cleanup (simplify, smooth, merge) | 🔴 | Ramer-Douglas-Peucker |
| 2.1.3 | Connected components analysis | 🔴 | Symbol grouping |
| 2.1.4 | Stroke segmentation (spatial clustering) | 🔴 | DBSCAN or similar |

### 2.2 Ring Detection

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.2.1 | Single ring detection | 🔴 | Ellipse fitting |
| 2.2.2 | Ring completeness detection | 🔴 | Gap analysis |
| 2.2.3 | Ring quality metrics (roundness, smoothness, neatness) | 🔴 | Multi-metric scoring |
| 2.2.4 | Multi-ring detection | 🔴 | Nested, linked, separate |
| 2.2.5 | Activation event detection | 🔴 | Open → closed transition |

### 2.3 Symbol Recognition

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.3.1 | Template-based matching (bitmap overlap) | 🔴 | From reference impl |
| 2.3.2 | Rotation-invariant matching for signs | 🔴 | Canonical pose at 270° |
| 2.3.3 | Layer detection (center, middle, outer) | 🔴 | Radial distance analysis |
| 2.3.4 | Confidence scoring | 🔴 | Multi-factor: ink overlap, shape, position |
| 2.3.5 | Ambiguity and contamination detection | 🔴 | Close match handling |

### 2.4 GlyphAST Output

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 2.4.1 | Ring output serialization | 🔴 | Full ring data |
| 2.4.2 | Candidate output serialization | 🔴 | Position, metrics, classification |
| 2.4.3 | Recognized symbol output | 🔴 | Sigil + sign data |
| 2.4.4 | Unknowns and warnings output | 🔴 | Diagnostics |
| 2.4.5 | Parser-level metrics | 🔴 | Neatness, symmetry, instability |

## Milestone 3: Compiler (Weeks 3-4)

### 3.1 Single-Element Compiler

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.1.1 | Primary sigil extraction | 🔴 | One sigil → element |
| 3.1.2 | Sign aggregation | 🔴 | Manifestation compilation |
| 3.1.3 | Parameter computation (force, spread, focus, etc.) | 🔴 | Base + sigil + sign deltas |
| 3.1.4 | Direction computation | 🔴 | Position, orientation, inward modes |
| 3.1.5 | Quality and stability scoring | 🔴 | Ring + sigil + sign neatness |
| 3.1.6 | Duration calculation | 🔴 | Quality-based lifetime |

### 3.2 Multi-Element Compiler

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.2.1 | Multi-sigil support design | 🔴 | Element mixing rules |
| 3.2.2 | Element combination logic | 🔴 | Fire+water = steam, etc. |
| 3.2.3 | Multi-ring compilation | 🔴 | Nested spell semantics |

### 3.3 SpellIR Output

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 3.3.1 | SpellIR serialization | 🔴 | Full behavior model |
| 3.3.2 | Invalid spell handling | 🔴 | Graceful degradation |
| 3.3.3 | Compiler warnings | 🔴 | Diagnostic messages |
| 3.3.4 | Spell signature generation | 🔴 | Identity string for render cache |

## Milestone 4: DSL (Week 5)

### 4.1 WHA-DSL Design

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 4.1.1 | DSL grammar specification | 🔴 | EBNF or PEG |
| 4.1.2 | Lexer implementation | 🔴 | Token types |
| 4.1.3 | Parser implementation | 🔴 | PEG parser |
| 4.1.4 | DSL → GlyphAST compiler | 🔴 | Mapping rules |
| 4.1.5 | GlyphAST → DSL decompiler | 🔴 | Bidirectional |

### 4.2 DSL Features

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 4.2.1 | Sigil declaration syntax | 🔴 | `sigil fire { force: 0.12 }` |
| 4.2.2 | Sign declaration syntax | 🔴 | `sign column at 90deg` |
| 4.2.3 | Ring declaration syntax | 🔴 | `ring { radius: 200 }` |
| 4.2.4 | Parameter overrides | 🔴 | Named parameter blocks |
| 4.2.5 | Import/include system | 🔴 | `import "fire-blast.wha"` |

## Milestone 5: Renderer (Weeks 5-7)

### 5.1 WebGL Core

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.1.1 | WebGL 2.0 context setup | 🔴 | Canvas initialization |
| 5.1.2 | Particle system framework | 🔴 | GPU particle simulation |
| 5.1.3 | Portal plane projection | 🔴 | 2D ring → 3D ellipse |
| 5.1.4 | Direction mapping | 🔴 | Paper-local 3D → screen 2D |

### 5.2 Element Effects

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.2.1 | Fire effect | 🔴 | Glowing particles, stream/suspended |
| 5.2.2 | Water effect | 🔴 | 3D stream, blob, highlights |
| 5.2.3 | Wind effect | 🔴 | Curved line particles |
| 5.2.4 | Earth effect | 🔴 | Square particles, slow/heavy |
| 5.2.5 | Light effect | 🔴 | Beam with trails, lane cohesion |
| 5.2.6 | Additional elements (dark, lightning, ice, nature, arcane) | 🔵 | Phase 2 |

### 5.3 Manifestation Effects

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 5.3.1 | Column manifestation | 🔴 | Directional beam/stream |
| 5.3.2 | Levitation manifestation | 🔴 | Suspended particles |
| 5.3.3 | Convergence manifestation | 🔴 | Compression + focus |
| 5.3.4 | Aura (default) | 🔴 | Ambient effect |
| 5.3.5 | Additional (barrier, projectile, area, shield) | 🔵 | Phase 2 |

## Milestone 6: UI (Weeks 6-8)

### 6.1 App Shell

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.1.1 | Next.js app setup | 🔴 | App Router |
| 6.1.2 | Layout components (header, sidebar, canvas area) | 🔴 | Responsive |
| 6.1.3 | Theme system (dark default) | 🔴 | CSS variables |
| 6.1.4 | i18n setup (EN/FR) | 🔴 | React Context pattern |
| 6.1.5 | Keyboard shortcuts system | 🔴 | Hotkey map |

### 6.2 Drawing Canvas

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.2.1 | Paper-textured drawing canvas | 🔴 | HTML5 Canvas |
| 6.2.2 | Effects overlay canvas (WebGL) | 🔴 | Layered compositing |
| 6.2.3 | Drawing tools (pen, eraser, select) | 🔴 | Tool palette |
| 6.2.4 | Brush settings (size, opacity, color) | 🔴 | Configurable |
| 6.2.5 | Undo/redo | 🔴 | History stack |
| 6.2.6 | Touch and pen support | 🔴 | Pressure sensitivity |

### 6.3 Panels

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 6.3.1 | Dictionary panel (sigils, signs, samples) | 🔴 | Searchable, categorized |
| 6.3.2 | Diagnostics panel (parser, AST, IR) | 🔴 | Collapsible, copyable |
| 6.3.3 | Spell state display | 🔴 | Active/prepared/invalid |
| 6.3.4 | Settings panel | 🔴 | Recognition, renderer config |

## Milestone 7: Tools & Polish (Weeks 8-10)

### 7.1 Reference Tools

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.1.1 | Stroke template maker | 🔴 | Port from reference |
| 7.1.2 | Stroke template viewer | 🔴 | Port from reference |
| 7.1.3 | Sigil/sign detector lab | 🔴 | Port from reference |
| 7.1.4 | Spell effect lab | 🔴 | Port from reference |

### 7.2 Import/Export

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.2.1 | SVG export | 🔴 | Vector output |
| 7.2.2 | PNG export | 🔴 | High-res raster |
| 7.2.3 | JSON project export/import | 🔴 | Full project serialization |
| 7.2.4 | Dictionary import/export | 🔴 | Community sharing |

### 7.3 Polish

| # | Task | Status | Notes |
| --- | --- | --- | --- |
| 7.3.1 | Loading states and skeletons | 🔴 | UX polish |
| 7.3.2 | Error boundaries | 🔴 | Graceful failure |
| 7.3.3 | Performance optimization | 🔴 | Code splitting, memo |
| 7.3.4 | Accessibility audit | 🔴 | WCAG 2.1 AA |
| 7.3.5 | Onboarding tutorial | 🔵 | Phase 2 |
| 7.3.6 | PWA support | 🔵 | Phase 2 |
