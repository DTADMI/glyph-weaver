# AGENTS.md — Glyph Weaver

## Repo Policy

- Follow the cross-project rules defined in `nebula-forge/AGENTS.md`.
- Node.js target: 22.22.3. pnpm target: 10.33.4.
- All new features must be behind feature flags.
- Keep docs aligned with code changes.

## Project Structure

```
glyph-weaver/
├── src/           # Source code
├── docs/          # Documentation
├── package.json
├── AGENTS.md
└── README.md
```

## Conventions

- Use TypeScript for all source code.
- Use pnpm for package management.
- Maintain a `docs/action-plan.md` sorted per legend.
- Run `pnpm run-all-checks` before every commit.
