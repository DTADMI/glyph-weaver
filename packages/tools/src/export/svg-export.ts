import type { Stroke, GlyphAST } from '@glyph-weaver/core'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function strokeToPath(stroke: Stroke, id: number): string {
  if (stroke.points.length === 0) return ''
  const parts: string[] = []
  const first = stroke.points[0]!
  parts.push(`M${first.x.toFixed(2)},${first.y.toFixed(2)}`)
  for (let i = 1; i < stroke.points.length; i++) {
    const pt = stroke.points[i]!
    parts.push(`L${pt.x.toFixed(2)},${pt.y.toFixed(2)}`)
  }
  const d = parts.join(' ')
  const color = escapeXml(stroke.color)
  return `<path id="stroke-${id}" d="${d}" fill="none" stroke="${color}" stroke-width="${stroke.width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" />`
}

export function exportToSVG(strokes: Stroke[], width: number, height: number, ringHighlight?: boolean): string {
  const paths = strokes.map((s, i) => strokeToPath(s, i)).filter(Boolean).join('\n  ')
  let ringOverlay = ''
  if (ringHighlight) {
    const cx = width / 2
    const cy = height / 2
    const r = Math.min(width, height) * 0.4
    ringOverlay = `\n  <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" fill="none" stroke="rgba(123,104,238,0.4)" stroke-width="2" stroke-dasharray="8,4" />`
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="transparent" />
  ${paths}${ringOverlay}
</svg>`
}

export function exportGlyphToSVG(ast: GlyphAST, width: number = 800, height: number = 800): string {
  const cx = width / 2
  const cy = height / 2
  const ringRadius = ast.ring.radius
  const scale = ringRadius > 0 ? (Math.min(width, height) * 0.4) / ringRadius : 1

  const labels: string[] = []

  if (ast.ring.found) {
    const r = ringRadius * scale
    let ringClass = ast.ring.complete ? 'ring-complete' : 'ring-incomplete'
    if (ast.ring.activationEvent) ringClass += ' ring-activated'
    labels.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}" class="${ringClass}" fill="none" stroke="#7b68ee" stroke-width="2" />`)
  }

  for (const sigil of ast.unsupportedMultipleSigils) {
    const x = sigil.radiusNorm * cx + cx
    const y = cy
    labels.push(`<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" class="sigil-label" fill="#ff6b6b" font-size="10" font-family="monospace">${escapeXml(sigil.id)} (alt)</text>`)
  }

  if (ast.primarySigil) {
    const s = ast.primarySigil
    const angleRad = (s.angleDeg * Math.PI) / 180
    const r = s.radiusNorm * ringRadius * scale
    const x = cx + r * Math.cos(angleRad)
    const y = cy + r * Math.sin(angleRad)
    labels.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="12" class="sigil-highlight" fill="none" stroke="#ff6b6b" stroke-width="2" />`)
    labels.push(`<text x="${(x + 16).toFixed(2)}" y="${(y + 4).toFixed(2)}" class="sigil-label" fill="#ff6b6b" font-size="11" font-family="monospace">sigil: ${escapeXml(s.id)} (${escapeXml(s.element)}) ${(s.confidence * 100).toFixed(0)}%</text>`)
  }

  for (const sign of ast.signs) {
    const angleRad = (sign.angleDeg * Math.PI) / 180
    const r = sign.radiusNorm * ringRadius * scale
    const x = cx + r * Math.cos(angleRad)
    const y = cy + r * Math.sin(angleRad)
    labels.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="8" class="sign-marker" fill="none" stroke="#4ecdc4" stroke-width="1.5" />`)
    labels.push(`<text x="${(x + 12).toFixed(2)}" y="${(y + 3).toFixed(2)}" class="sign-label" fill="#4ecdc4" font-size="10" font-family="monospace">sign: ${escapeXml(sign.id)} ${(sign.confidence * 100).toFixed(0)}%</text>`)
  }

  const labelStr = labels.join('\n  ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0a0a16" />
  ${labelStr}
</svg>`
}
