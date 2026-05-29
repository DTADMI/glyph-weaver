# Encoding Reference

All files in the Glyph Weaver repository must follow these encoding conventions.

## Encoding Standards

| Rule | Requirement |
| --- | --- |
| Text encoding | UTF-8 without BOM |
| Line endings | LF (`\n`) |
| Tab/space | Spaces only (2-space indent, per `.editorconfig`) |

## Quebec French Characters

The project supports Quebec French localization (default locale `fr`). The following characters must be handled correctly in all source files:

- **Accented vowels**: e, e, e, e, a, a, u, u, o, o, i, i
- **Cedilla**: c
- **Ligature**: oe

These characters use multi-byte UTF-8 sequences. PowerShell piping and certain Windows tools can corrupt them if not handled carefully.

## PowerShell-to-File Best Practices

### Writing files

Always use .NET methods for reliable UTF-8 without BOM:

```powershell
[System.IO.File]::WriteAllText($path, $content, [Text.Encoding]::UTF8)
```

Avoid `Out-File` defaults which produce UTF-16 LE on Windows PowerShell 5.1.

### Reading files

```powershell
$bytes = [System.IO.File]::ReadAllBytes($path)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$content = $utf8NoBom.GetString($bytes)
```

### Piping

Never pipe SQL with accented characters through `docker exec -i psql`. The encoding is lost at the pipe boundary. Use file copy + `-f` execution instead.

## Checking Encoding

Run the encoding checker to scan all source files:

```powershell
.\scripts\check-encoding.ps1
```

Add `-Verbose` to see per-file output:

```powershell
.\scripts\check-encoding.ps1 -Verbose
```

Exit code 0 means no issues found. Exit code 1 means issues were found and reported.

## Fixing Encoding

Run the fixer to automatically normalize all source files:

```powershell
.\scripts\fix-encoding.ps1
```

Add `-Verbose` to see each file as it is fixed:

```powershell
.\scripts\fix-encoding.ps1 -Verbose
```

The fixer:
- Strips UTF-8 BOM from all files
- Normalizes CRLF to LF line endings
- Writes using `[System.IO.File]::WriteAllText(path, content, [Text.Encoding]::UTF8)`

## .gitattributes

The `.gitattributes` file enforces LF line endings for all text file types:

```
*.ts    text eol=lf
*.tsx   text eol=lf
*.js    text eol=lf
*.css   text eol=lf
*.json  text eol=lf
*.md    text eol=lf
*.html  text eol=lf
*.sql   text eol=lf
*.sh    text eol=lf
*.ps1   text eol=lf
```
