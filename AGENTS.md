# AGENTS.md — Glyph Weaver

Project-specific rules and guidance for coding agents.

## Repo Policy

- Follow the cross-project rules defined in `nebula-forge/AGENTS.md`.
- Node.js target: 22.22.3. pnpm target: 10.33.4.
- TypeScript strict mode everywhere. No `any` without explicit justification.
- Keep docs aligned with code and schema changes.
- Run `pnpm run-all-checks` before every commit. Never skip hooks.

## Project Architecture

Glyph Weaver is a monorepo structured as follows:

```
glyph-weaver/
  packages/
    core/           # Shared types (GlyphAST, SpellIR), Zod schemas, config
    dictionary/     # Sigil/sign/sample-spell dictionary definitions
    parser/         # Stroke → GlyphAST pipeline (future)
    compiler/       # GlyphAST → SpellIR pipeline (future)
    dsl/            # WHA-DSL lexer/parser/compiler (future)
    renderer/       # WebGL/Canvas visual effects (future)
    ui/             # React components, canvas shell (future)
    tools/          # Stroke template maker, effect lab (future)
  apps/
    web/            # Next.js frontend (future)
  docs/             # Documentation
    project-spec.md       # Full product specification
    action-plan.md        # Action plan sorted per legend
```

## Key Contracts

The core data pipeline:

```
Drawing Canvas → Parser → GlyphAST → Compiler → SpellIR → Renderer → Effects Canvas
```

- **GlyphAST**: Parsed drawing structure (ring, candidates, sigils, signs, unknowns). See `packages/core/src/types/glyph-ast.ts`.
- **SpellIR**: Compiled spell behavior (validity, element, manifestations, parameters). See `packages/core/src/types/spell-ir.ts`.
- **Dictionary**: Sigil/sign definitions with stroke templates. See `packages/core/src/types/dictionary.ts`.

## Conventions

- Use TypeScript strict mode for all source code.
- Use pnpm workspaces for monorepo management.
- Package names use `@glyph-weaver/` scope.
- Maintain `docs/action-plan.md` sorted per legend (🔴🟡🟢⚪🔵).
- User-facing strings must resolve through i18n (EN/FR).
- All UI must be responsive, mobile-first, minimum 320px width.
- Never expose developer-facing notes in user-facing product surfaces.

## Fan Project Status

This project is inspired by the magic system in *Witch Hat Atelier* (Kamome Shirahama / Kodansha). It is an unofficial, unaffiliated fan project. Do not:
- Use copyrighted manga/anime artwork or panels as assets
- Use "Witch Hat Atelier" in product branding
- Claim official association
- Reproduce canonical sigil designs 1:1 without fan-art disclaimers

The reference implementation ytnrvdf/wha-spell-simulator (288 stars, MIT) provides architectural inspiration.
