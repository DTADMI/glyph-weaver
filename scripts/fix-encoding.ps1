param(
  [switch]$Verbose
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$fixed = 0
$errors = 0

$extensions = @('*.ts', '*.tsx', '*.css', '*.json', '*.md', '*.js', '*.jsx', '*.html', '*.sql', '*.sh', '*.ps1', '*.yml', '*.yaml')

foreach ($ext in $extensions) {
  $files = Get-ChildItem -LiteralPath $repoRoot -Filter $ext -Recurse -File -ErrorAction SilentlyContinue

  foreach ($file in $files) {
    $fullPath = $file.FullName

    if ($fullPath -match '\\node_modules\\' -or
        $fullPath -match '\\node_modules$' -or
        $fullPath -match '\\.next\\' -or
        $fullPath -match '\\.next$' -or
        $fullPath -match '\\dist\\' -or
        $fullPath -match '\\dist$' -or
        $fullPath -match '\.tsbuildinfo$') {
      continue
    }

    $relativePath = $fullPath.Substring($repoRoot.Length + 1)

    try {
      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    } catch {
      Write-Warning "Cannot read $relativePath : $_"
      $errors++
      continue
    }

    $needsFix = $false

    $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
    if ($hasBom) {
      $needsFix = $true
    }

    $hasCRLF = $false
    for ($i = 0; $i -lt $bytes.Length - 1; $i++) {
      if ($bytes[$i] -eq 0x0D -and $bytes[$i + 1] -eq 0x0A) {
        $hasCRLF = $true
        break
      }
    }
    if ($hasCRLF) {
      $needsFix = $true
    }

    if (-not $needsFix) { continue }

    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    try {
      $content = $utf8NoBom.GetString($bytes)
    } catch {
      Write-Warning "Cannot decode $relativePath as UTF-8 : $_"
      $errors++
      continue
    }

    $content = $content -replace "`r`n", "`n"

    try {
      [System.IO.File]::WriteAllText($fullPath, $content, [Text.Encoding]::UTF8)
      if ($Verbose) { Write-Host "Fixed: $relativePath" }
      $fixed++
    } catch {
      Write-Warning "Cannot write $relativePath : $_"
      $errors++
    }
  }
}

Write-Host "Fixed: $fixed file(s), Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { 'Yellow' } else { 'Green' })
if ($errors -gt 0) { exit 1 } else { exit 0 }
