param(
  [switch]$Verbose
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$issues = @()

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
      continue
    }

    $hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF
    if ($hasBom) {
      $issues += @{ Path = $relativePath; Issue = 'UTF-8 BOM detected' }
      if ($Verbose) { Write-Host "BOM: $relativePath" }
    }

    $hasCRLF = $false
    for ($i = 0; $i -lt $bytes.Length - 1; $i++) {
      if ($bytes[$i] -eq 0x0D -and $bytes[$i + 1] -eq 0x0A) {
        $hasCRLF = $true
        break
      }
    }
    if ($hasCRLF) {
      $issues += @{ Path = $relativePath; Issue = 'CRLF line endings detected' }
      if ($Verbose) { Write-Host "CRLF: $relativePath" }
    }
  }
}

if ($issues.Count -gt 0) {
  Write-Host "Encoding issues found: $($issues.Count)" -ForegroundColor Red
  $groups = $issues | Group-Object -Property Path
  foreach ($group in $groups) {
    $filePath = $group.Name
    $issueList = ($group.Group | ForEach-Object { $_.Issue }) -join ', '
    Write-Host "  $filePath`t$issueList"
  }
  exit 1
} else {
  Write-Host 'No encoding issues found.' -ForegroundColor Green
  exit 0
}
