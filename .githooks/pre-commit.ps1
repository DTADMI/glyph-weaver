$ErrorActionPreference = "Stop"

# ═══ SKIP_PRECOMMIT -- WIP mode (CI still runs on push) ═══
if ($env:SKIP_PRECOMMIT -eq "1") {
    Write-Host "⚠️  SKIP_PRECOMMIT=1 -- pre-commit checks skipped (WIP mode)" -ForegroundColor Yellow
    Write-Host "   CI will still run on push. Do NOT use this for final commits." -ForegroundColor Yellow
    exit 0
}

$quickMode = $args[0] -eq "--quick"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🔍 Glyph Weaver -- Pre-commit checks" -ForegroundColor Cyan
if ($quickMode) {
    Write-Host "  ⚡ QUICK mode -- lint --cache + typecheck only (CI runs the rest)" -ForegroundColor Yellow
} else {
    Write-Host "  Full: format:check → typecheck → lint --cache → test → build" -ForegroundColor Cyan
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allPassed = $true

function Run-Check {
    param([string]$Label, [string]$Command)
    Write-Host ""
    Write-Host "  [$Label] Running..." -ForegroundColor Gray
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ $Label FAILED" -ForegroundColor Red
        $global:allPassed = $false
    } else {
        Write-Host "  ✅ $Label passed" -ForegroundColor Green
    }
}

# ── 1. Format check ──────────────────────────
Run-Check "format:check" "pnpm format:check"

# ── 2. Typecheck ─────────────────────────────
Run-Check "typecheck" "pnpm typecheck"

# ── 3. Lint (--cache for incremental) ────────
Run-Check "lint" "pnpm lint --cache"

# ── If --quick, stop here ────────────────────
if ($quickMode) {
    Write-Host ""
    if ($allPassed) {
        Write-Host "  ⚡ Quick check passed! Full checks (test + build) deferred to CI." -ForegroundColor Green
        exit 0
    } else {
        Write-Host "  ❌ Quick check failed. Fix the issues above, then commit." -ForegroundColor Red
        exit 1
    }
}

# ── 4. Test ──────────────────────────────────
Run-Check "test" "pnpm test"

# ── 5. Build ─────────────────────────────────
Run-Check "build" "pnpm build"

# ── Final gate ───────────────────────────────
Write-Host ""
if ($allPassed) {
    Write-Host "  ✅ All pre-commit checks passed! Committing..." -ForegroundColor Green
    exit 0
} else {
    Write-Host "  ❌ Pre-commit failed. Fix the issues above." -ForegroundColor Red
    Write-Host "     WIP only: `$env:SKIP_PRECOMMIT=1; git commit" -ForegroundColor Yellow
    Write-Host "     Quick:    .githooks/pre-commit --quick" -ForegroundColor Yellow
    exit 1
}