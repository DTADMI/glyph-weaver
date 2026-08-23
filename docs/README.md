# Glyph Weaver — Spell Glyph Crafting Library

**Owner:** Nebula Forge Digital Studio  
**Last Updated:** 2025-07-16

A monorepo of TypeScript libraries for creating, parsing, compiling, and rendering magical spell glyphs. Core types, a stroke-to-glyph parser, a glyph compiler, a DSL interpreter, and a WebGL renderer — designed as the magic system foundation for interactive experiences.

---

## 📁 Project Structure

```
glyph-weaver/
├── packages/
│   ├── core/              # Shared types (GlyphAST, SpellIR), Zod schemas, config
│   ├── dictionary/        # Sigil, sign, and sample-spell dictionary definitions
│   ├── parser/            # Stroke → GlyphAST pipeline
│   ├── compiler/          # GlyphAST → SpellIR pipeline
│   ├── dsl/               # WHA-DSL lexer/parser/compiler
│   └── renderer/          # WebGL/Canvas visual effects
├── apps/
│   └── web/               # Demo/editor web application (Next.js)
├── docs/
│   ├── project-spec.md     # Full project specification
│   └── action-plan.md      # Implementation tracker
├── .github/workflows/      # CI pipeline
└── AGENTS.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool    | Version | Check            |
| ------- | ------- | ---------------- |
| Node.js | 26.3.0  | `node --version` |
| pnpm    | 11.5.0  | `pnpm --version` |

### Install

```bash
git clone https://github.com/nebulaforge/glyph-weaver.git
cd glyph-weaver
pnpm install
pnpm build            # Build all packages
```

### Development

```bash
pnpm build            # Build packages first
cd apps/web
pnpm dev              # Web demo at http://localhost:3000
```

### Testing

```bash
pnpm test             # Run all package tests (Vitest)
pnpm typecheck        # TypeScript check all packages
pnpm lint             # ESLint all packages
pnpm run-all-checks   # Full pre-commit suite
```

---

## 🏗 Architecture

### Type Pipeline

```
Stroke (user input)
  → parser/       → GlyphAST   (structured glyph representation)
  → compiler/     → SpellIR    (intermediate representation)
  → dsl/          → WHA-DSL    (human-readable spell language)
  → renderer/     → Visual output (WebGL particle effects)
```

### Packages

| Package        | Status | Description                                                     |
| -------------- | ------ | --------------------------------------------------------------- |
| **core**       | ✅     | `GlyphNode`, `SpellNode`, Zod schemas, glyph/spell config types |
| **dictionary** | ✅     | Sigil definitions, sign catalog, sample spells for testing      |
| **parser**     | 🔵     | Canvas stroke input → touch/pointer events → GlyphAST           |
| **compiler**   | 🔵     | GlyphAST → SpellIR with type checking, effect resolution        |
| **dsl**        | 🔵     | WHA-DSL lexer, parser (PEG.js), compiler to SpellIR             |
| **renderer**   | 🔵     | WebGL particle system, Canvas 2D fallback, animation loop       |

---

## 🎮 Concepts

### Glyph

A visual symbol drawn by the user. Defined by strokes, proportions, and spatial relationships.

### Sigil

The abstract meaning of a glyph. A fire sigil represents the concept of fire.

### Spell

A combination of glyphs producing an effect. `Fire + Push = Fireball`

### WHA-DSL

The **W**eaver's **H**igh **A**rcanum **D**omain **S**pecific **L**anguage — a human-readable language for defining and composing spells.

```
spell Fireball {
  glyphs: [Fire(1.0), Push(0.8)]
  effect: Projectile(type: Fire, force: Push)
  cost: 15 mana
  castTime: 2.5s
}
```

---

## 🧪 Testing

```bash
pnpm test             # Vitest across all packages
pnpm run-all-checks   # typecheck + lint + test + build
```

---

## 🔧 Troubleshooting

| Problem                     | Solution                                                          |
| --------------------------- | ----------------------------------------------------------------- |
| `pnpm build` fails          | Run `pnpm install` first — package interdependencies need linking |
| Web demo shows nothing      | Ensure `pnpm build` completed (packages must be built)            |
| TypeScript errors in editor | Restart TS server after `pnpm build`                              |

---

Built with ❤️ by Nebula Forge Digital Studio
