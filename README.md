# Glyph Weaver

A tool for crafting and manipulating symbolic glyph systems, runic alphabets, and custom character sets. Inspired by the magic system in *Witch Hat Atelier* (Kamome Shirahama / Kodansha).

> **Fan Project Notice**: This is an unofficial, unaffiliated project. *Witch Hat Atelier* and related names, artwork, symbols, and trademarks belong to their respective rights holders.

## Overview

Glyph Weaver provides a programmable glyph engine with:
- A **domain-specific language** (WHA-DSL) for defining spell diagrams textually
- **Multi-ring compilation** with nested and linked spell circles
- **Extensible dictionary** system for custom sigils, signs, and glyph systems
- **GPU-accelerated rendering** with WebGL particle effects
- **Bidirectional pipeline**: Draw → Parse → Compile → Render, or DSL → Compile

## Architecture

```
Drawing Canvas → Parser → GlyphAST → Compiler → SpellIR → Renderer → Effects Canvas
                    ↑                        ↑
              Dictionary              DSL Source Code
```

## Getting Started

```bash
pnpm install
pnpm build
pnpm run-all-checks
```

## Packages

| Package | Description |
| --- | --- |
| `@glyph-weaver/core` | Shared types (GlyphAST, SpellIR), Zod schemas, config |
| `@glyph-weaver/dictionary` | Sigil/sign/sample-spell definitions |
| `@glyph-weaver/parser` | Stroke → GlyphAST pipeline |
| `@glyph-weaver/compiler` | GlyphAST → SpellIR pipeline |
| `@glyph-weaver/dsl` | WHA-DSL lexer/parser/compiler |
| `@glyph-weaver/renderer` | WebGL/Canvas visual effects |
| `@glyph-weaver/ui` | React components |
| `@glyph-weaver/tools` | Stroke template maker, effect lab |
| `@glyph-weaver/web` | Next.js frontend app |

## Docs

- [Project Specification](docs/project-spec.md) — Full feature catalog, architecture, requirements
- [Action Plan](docs/action-plan.md) — Milestone-based implementation plan
- [AGENTS.md](AGENTS.md) — Project rules for coding agents

## License

MIT
