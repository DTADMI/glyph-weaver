# Performance Optimization

## SSR Strategy

Glyph Weaver uses React Server Components (RSC) for the Next.js web application. Pages are classified into tiers:

| Tier | Pages | Strategy | Revalidation |
| --- | --- | --- | --- |
| Public | Landing, Docs | SSG + ISR | `revalidate = 3600` |
| Drawing | Canvas Shell | Static shell, client-hydrated canvas | `revalidate = false` |
| Library | Dictionary, Spells | ISR | `revalidate = 300` |
| Admin | User management, Analytics | SSR with `force-dynamic` | N/A |

- Public content pages export `revalidate` with a value appropriate to the content change rate.
- Dynamic routes serving public content implement `generateStaticParams` for high-traffic entries.
- Static pages use Partial Prerendering (`experimental.ppr = 'incremental'`) where available.

## Caching Layers

| Layer | Mechanism | Purpose |
| --- | --- | --- |
| React | `React.cache()` | Deduplicate expensive data-fetching functions within a render tree |
| Next.js | `fetch` cache | Automatic HTTP fetch deduplication |
| Client | `localStorage` / `MemoryStorageAdapter` | Persist project state, strokes, config between sessions |
| CDN | Vercel Edge Cache | Static assets, ISR pages |

- Use `React.cache()` for `createClient()`, `getShellContext()`, `getUser()`, and any function called from multiple components in the same render tree.
- Configure `experimental.staleTimes` in `next.config.mjs` for client-side cache duration.

## Code Splitting

- Use `next/dynamic` with `ssr: false` for WebGL canvas and heavy renderer components.
- Configure `experimental.optimizePackageImports` for Radix UI, lucide-react, and date-fns.
- Lazy-load the dictionary panel, spell editor, and effect lab.
- The tools package (`@glyph-weaver/tools`) exports individual entry points to allow tree-shaking.

## Render Optimization

- Drawing canvas uses `requestAnimationFrame` loop with `PerformanceMonitor` for FPS tracking.
- Strokes are batched and drawn in a single pass using canvas paths.
- WebGL effects use instanced rendering where applicable, capped at the configured `particleCap` (default: 500).
- Effect previews clamp parameter ranges to prevent shader overwork.
- `debounce()` input handlers (pen, sliders) at 16ms for canvas draw events.
- `throttle()` resize observers at 200ms for responsive layout adjustments.

## Build & Bundle

- `ignoreCommand` in Vercel project settings skips preview builds for docs-only and metadata-only changes.
- Package imports use `isolatedModules: true` for compile-time optimization.
- Common dependencies are hoisted via pnpm workspace to avoid duplication.
- `.tsbuildinfo` and `incremental: true` accelerate TypeScript compilation.

## Monitoring

- `PerformanceMonitor` class tracks FPS, frame time, memory usage (via `performance.memory`), and event counts.
- Frame drops above 33.34ms (30 FPS threshold) are logged in the performance report.
- Memory snapshots are taken at configurable intervals for leak detection.
- All performance data is recorded to `PerformanceReport` for analysis.

## Target Budgets

| Metric | Desktop | Mobile |
| --- | --- | --- |
| FPS (canvas draw) | >= 55 | >= 30 |
| FPS (effect preview) | >= 30 | >= 20 |
| First Contentful Paint | < 1.5s | < 2.5s |
| Time to Interactive | < 3s | < 5s |
| Bundle size (tools) | < 50KB gzip | < 50KB gzip |
| Bundle size (ui) | < 30KB gzip | < 30KB gzip |

## Tips

- Never downgrade a page from static/ISR to `force-dynamic` without documenting the reason.
- New `force-dynamic` pages require justification in the page file.
- Pages with list data must paginate; never return unbounded result sets.
- Never remove `cache()` wrappers from shared data-fetching functions.
- Treat Vercel build CPU as the first cost lever; optimize preview build volume before chasing small runtime line items.
